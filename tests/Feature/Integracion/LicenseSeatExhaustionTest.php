<?php

namespace Tests\Feature\Integracion;

use App\Models\License;
use App\Models\User;
use Tests\TestCase;

/**
 * Sprint 3 — Pruebas de Integración (ISO/IEC/IEEE 29119). Caso CPF-08 (relacionado con INT-04).
 *
 * Aporte del grupo (Anette). Agotamiento de asientos de licencia.
 *
 * Integra: License ↔ LicenseSeat ↔ User a través del controlador de checkout de licencias.
 * Verifica que, una vez agotados los asientos, la frontera de control (LicenseCheckoutController)
 * impide nuevas asignaciones (`availCount() < 1` → error), sin sobre-asignar.
 */
class LicenseSeatExhaustionTest extends TestCase
{
    /**
     * CPF-08 — Con un único asiento ya ocupado, un segundo checkout debe rechazarse
     * y no debe producirse una sobre-asignación.
     */
    public function test_cpf_08_checkout_es_rechazado_cuando_no_quedan_asientos()
    {
        $admin = User::factory()->superuser()->create();
        $usuarioA = User::factory()->create();
        $usuarioB = User::factory()->create();

        // Licencia con un único asiento.
        $license = License::factory()->create(['seats' => 1]);
        $this->assertEquals(1, $license->availCount()->count(), 'La licencia debe iniciar con 1 asiento libre.');

        // 1) Se ocupa el único asiento disponible.
        $this->actingAs($admin)->post(route('licenses.checkout', $license), [
            'checkout_to_type' => 'user',
            'assigned_to' => $usuarioA->id,
            'asset_id' => null,
        ]);
        $this->assertEquals(0, $license->refresh()->availCount()->count(), 'Tras el primer checkout no deben quedar asientos.');

        // 2) Falla inyectada: nuevo checkout sin asientos disponibles.
        $this->actingAs($admin)->post(route('licenses.checkout', $license), [
            'checkout_to_type' => 'user',
            'assigned_to' => $usuarioB->id,
            'asset_id' => null,
        ])->assertSessionHas('error');

        // 3) No hubo sobre-asignación: el asiento sigue siendo de A y B no recibió ninguno.
        $this->assertEquals(0, $license->refresh()->availCount()->count());
        $this->assertDatabaseHas('license_seats', ['license_id' => $license->id, 'assigned_to' => $usuarioA->id]);
        $this->assertDatabaseMissing('license_seats', ['license_id' => $license->id, 'assigned_to' => $usuarioB->id]);
    }
}
