import { evaluarVenta, redondearKg } from './inventario.rules';

describe('Reglas de inventario (SWR-INV-003)', () => {
  it('UNIT-07 permite vender menos que el inventario disponible', () => {
    expect(evaluarVenta(100, 40)).toEqual({ permitida: true });
  });

  it('UNIT-08 permite vender exactamente el inventario disponible (valor límite)', () => {
    expect(evaluarVenta(100, 100)).toEqual({ permitida: true });
  });

  it('UNIT-09 rechaza vender más que el disponible y explica el motivo', () => {
    const r = evaluarVenta(100, 100.01);
    expect(r.permitida).toBe(false);
    if (!r.permitida) {
      expect(r.motivo).toContain('Inventario insuficiente');
    }
  });

  it('UNIT-10 rechaza cantidades cero o negativas', () => {
    expect(evaluarVenta(100, 0).permitida).toBe(false);
    expect(evaluarVenta(100, -5).permitida).toBe(false);
  });

  it('UNIT-11 rechaza cualquier venta cuando no hay inventario', () => {
    expect(evaluarVenta(0, 1).permitida).toBe(false);
  });

  it('UNIT-12 redondea a 2 decimales evitando errores de coma flotante', () => {
    expect(redondearKg(0.1 + 0.2)).toBe(0.3);
  });
});
