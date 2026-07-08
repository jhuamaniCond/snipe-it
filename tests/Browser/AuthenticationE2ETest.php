<?php

namespace Tests\Browser;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Sprint 3–4 — Pruebas de SISTEMA (E2E) con Laravel Dusk. ISO/IEC/IEEE 29119.
 *
 * Aporte del grupo. Recorridos de autenticación por la UI real desplegada
 * (navegador Chrome contra la app corriendo), cubriendo E2E-01 y E2E-06 (RF-09).
 *
 * A diferencia de tests/Feature (que SIMULAN la petición en el proceso PHP), aquí
 * un navegador real visita la app servida y ejecuta el flujo como un usuario.
 *
 * Requisitos de ejecución: ver `trabajoLibelula/HITO-3/Sistema/GUIA-DUSK-E2E.md`.
 */
class AuthenticationE2ETest extends DuskTestCase
{
    use DatabaseTruncation;

    // La app requiere una fila 'settings' (sembrada una vez); no la truncamos entre pruebas.
    protected array $exceptTables = ['migrations', 'settings'];

    /**
     * E2E-01 — Login válido: el usuario ingresa credenciales correctas y llega al dashboard.
     */
    public function test_e2e_01_login_valido_lleva_al_dashboard(): void
    {
        // La UserFactory usa por defecto la contraseña "password".
        $user = User::factory()->superuser()->create([
            'username' => 'e2e_admin',
            'password' => bcrypt('password'),
            'activated' => 1,
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->visit('/login')
                    ->type('username', 'e2e_admin')
                    ->type('password', 'password')
                    ->press('#submit')
                    ->waitForLocation('/')          // redirección al dashboard
                    ->assertPathIs('/')
                    ->assertAuthenticated();
        });
    }

    /**
     * E2E-01b — Login inválido: credenciales incorrectas mantienen al usuario fuera.
     */
    public function test_e2e_01b_login_invalido_es_rechazado(): void
    {
        User::factory()->create([
            'username' => 'e2e_user',
            'password' => bcrypt('password'),
            'activated' => 1,
        ]);

        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                    ->type('username', 'e2e_user')
                    ->type('password', 'clave-incorrecta')
                    ->press('#submit')
                    ->assertPathIs('/login')        // no entra
                    ->assertGuest();
        });
    }

    /**
     * E2E-06 — Logout: tras cerrar sesión, una ruta protegida ya no es accesible.
     */
    public function test_e2e_06_logout_cierra_la_sesion(): void
    {
        $user = User::factory()->superuser()->create(['activated' => 1]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/')
                    ->assertAuthenticated()
                    // El logout de Snipe-IT es POST /logout desde el menú de usuario.
                    // Se invoca el endpoint mediante el enlace del menú.
                    ->visit('/logout')              // GET /logout (logout.get) redirige a login
                    ->assertPathIs('/login')
                    ->assertGuest();
        });
    }
}
