<?php

namespace Tests\Feature\Integracion;

use App\Models\Asset;
use App\Models\AssetModel;
use App\Models\Depreciation;
use Tests\TestCase;

/**
 * Sprint 3 — Pruebas de Integración (ISO/IEC/IEEE 29119). Caso INT-12.
 *
 * Aporte propio del grupo (no pertenece a la suite original de Snipe-IT).
 *
 * Verifica la integración entre TRES subsistemas para el cálculo del valor depreciado:
 *   Depreciation  →  AssetModel (depreciation_id)  →  Asset (get_depreciation()).
 *
 * El activo no define su depreciación directamente: la resuelve a través de su modelo
 * (`Asset::get_depreciation()` = `model->depreciation`). Se ejercita el método de
 * depreciación lineal (`getLinearDepreciatedValue()`), que no depende de servicios
 * externos, con estado persistido real (`RefreshDatabase`).
 */
class DepreciacionIntegracionTest extends TestCase
{
    /**
     * Construye un modelo enlazado a una depreciación de N meses y devuelve un activo
     * con el costo y la fecha de compra indicados.
     */
    private function activoConDepreciacion(int $meses, float $costo, $fechaCompra): Asset
    {
        $depreciacion = Depreciation::factory()->create(['months' => $meses]);
        $modelo = AssetModel::factory()->create(['depreciation_id' => $depreciacion->id]);

        return Asset::factory()->create([
            'model_id' => $modelo->id,
            'purchase_cost' => $costo,
            'purchase_date' => $fechaCompra,
        ]);
    }

    /**
     * INT-12a — La depreciación resuelta a través del modelo produce un valor coherente
     * en los extremos: activo nuevo = costo total; activo agotado = 0.
     */
    public function test_int12_valor_depreciado_en_los_extremos()
    {
        // Recién comprado (0 meses): conserva el costo total.
        $nuevo = $this->activoConDepreciacion(12, 1200, now());
        $this->assertEquals(1200, $nuevo->getLinearDepreciatedValue());

        // Vida útil superada (24 > 12 meses, sin piso): valor 0.
        $agotado = $this->activoConDepreciacion(12, 1200, now()->subMonths(24));
        $this->assertEquals(0, $agotado->getLinearDepreciatedValue());
    }

    /**
     * INT-12b — A mitad de la vida útil (6 de 12 meses) el valor lineal ronda la mitad
     * del costo. Se usa una tolerancia por el redondeo de meses transcurridos.
     */
    public function test_int12_valor_depreciado_a_mitad_de_vida()
    {
        $mitad = $this->activoConDepreciacion(12, 1200, now()->subMonths(6));

        $this->assertEqualsWithDelta(600, $mitad->getLinearDepreciatedValue(), 100);
    }

    /**
     * INT-12c — Integración/monotonía: con igual costo y depreciación, un activo más
     * antiguo debe depreciarse MÁS que uno más nuevo, y todo valor debe caer en [0, costo].
     */
    public function test_int12_activo_mas_antiguo_se_deprecia_mas()
    {
        $nuevo = $this->activoConDepreciacion(12, 1000, now()->subMonths(2));
        $antiguo = $this->activoConDepreciacion(12, 1000, now()->subMonths(9));

        $vNuevo = $nuevo->getLinearDepreciatedValue();
        $vAntiguo = $antiguo->getLinearDepreciatedValue();

        $this->assertLessThan($vNuevo, $vAntiguo, 'El activo más antiguo debe valer menos.');
        $this->assertGreaterThanOrEqual(0, $vAntiguo);
        $this->assertLessThanOrEqual(1000, $vNuevo);
    }
}
