import { puedeConfirmarCosecha, validarCosecha } from './cosecha.rules';

describe('Reglas de cosecha (SWR-COS-001 / SWR-INV-001)', () => {
  const hoy = new Date('2026-11-15T12:00:00Z');

  it('UNIT-13 acepta una cosecha con cantidad positiva y fecha pasada', () => {
    const r = validarCosecha({ cantidadKg: 50, fecha: new Date('2026-11-10') }, hoy);
    expect(r.valido).toBe(true);
  });

  it('UNIT-14 rechaza una fecha futura', () => {
    const r = validarCosecha({ cantidadKg: 50, fecha: new Date('2026-11-16') }, hoy);
    expect(r.valido).toBe(false);
    expect(r.errores[0]).toMatch(/futura/i);
  });

  it('UNIT-15 rechaza una cantidad cero (valor límite)', () => {
    const r = validarCosecha({ cantidadKg: 0, fecha: new Date('2026-11-10') }, hoy);
    expect(r.valido).toBe(false);
  });

  it('UNIT-16 rechaza una fecha inválida', () => {
    const r = validarCosecha({ cantidadKg: 5, fecha: new Date('no-es-fecha') }, hoy);
    expect(r.valido).toBe(false);
  });

  it('UNIT-17 solo permite confirmar una cosecha REGISTRADA', () => {
    expect(puedeConfirmarCosecha('REGISTRADA')).toBe(true);
    expect(puedeConfirmarCosecha('CONFIRMADA')).toBe(false);
  });
});
