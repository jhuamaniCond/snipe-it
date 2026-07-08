<?php

namespace Tests\Feature\Integracion;

use App\Models\Asset;
use App\Models\Company;
use App\Models\Statuslabel;
use App\Models\User;
use Tests\TestCase;

/**
 * Sprint 3 — Pruebas de Integración (ISO/IEC/IEEE 29119). Caso INT-07 (FMCS).
 *
 * Aporte del grupo (Anette). Full Multiple Companies Support (scoping por empresa).
 *
 * Integra: Setting (FMCS) ↔ Company ↔ Asset ↔ User a través del checkout de activos.
 * Con FMCS activo, un activo de la empresa A NO puede entregarse a un usuario de la empresa B.
 * El bloqueo se aplica incluso a un superusuario (no lo evade). Se incluye un control
 * positivo: dentro de la misma empresa el checkout sí procede.
 */
class FmcsCrossCompanyTest extends TestCase
{
    /**
     * INT-07a — Checkout cruzado entre empresas distintas debe rechazarse.
     */
    public function test_int07_fmcs_impide_checkout_entre_empresas_distintas()
    {
        $this->settings->enableMultipleFullCompanySupport();

        $empresaA = Company::factory()->create();
        $empresaB = Company::factory()->create();

        // Activo disponible de la empresa A; usuario destino de la empresa B.
        $asset = Asset::factory()->create([
            'company_id' => $empresaA->id,
            'status_id' => Statuslabel::factory()->readyToDeploy()->create()->id,
        ]);
        $usuarioB = User::factory()->create(['company_id' => $empresaB->id]);

        $this->actingAs(User::factory()->superuser()->create())
            ->post(route('hardware.checkout.store', $asset), [
                'checkout_to_type' => 'user',
                'assigned_user' => $usuarioB->id,
            ])
            ->assertSessionHas('error');

        $asset->refresh();
        $this->assertNull($asset->assigned_to, 'FMCS debe impedir el checkout entre empresas distintas.');
    }

    /**
     * INT-07b — Control positivo: dentro de la MISMA empresa el checkout procede con FMCS activo.
     */
    public function test_int07_fmcs_permite_checkout_dentro_de_la_misma_empresa()
    {
        $this->settings->enableMultipleFullCompanySupport();

        $empresa = Company::factory()->create();

        $asset = Asset::factory()->create([
            'company_id' => $empresa->id,
            'status_id' => Statuslabel::factory()->readyToDeploy()->create()->id,
        ]);
        $usuario = User::factory()->create(['company_id' => $empresa->id]);

        $this->actingAs(User::factory()->superuser()->create())
            ->post(route('hardware.checkout.store', $asset), [
                'checkout_to_type' => 'user',
                'assigned_user' => $usuario->id,
            ]);

        $this->assertEquals(
            $usuario->id,
            $asset->refresh()->assigned_to,
            'Dentro de la misma empresa el checkout debe proceder.'
        );
    }
}
