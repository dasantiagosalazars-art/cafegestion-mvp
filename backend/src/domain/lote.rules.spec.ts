import { normalizarNombreLote, validarLote } from './lote.rules';

describe('Reglas de lote (SWR-LOTE-001 / SWR-LOTE-002)', () => {
  it('UNIT-01 normaliza el nombre sin distinguir mayúsculas ni espacios sobrantes', () => {
    // Arrange
    const nombre = '  El Mirador  ';
    // Act
    const resultado = normalizarNombreLote(nombre);
    // Assert
    expect(resultado).toBe('el mirador');
  });

  it('UNIT-02 acepta un lote con datos válidos', () => {
    const r = validarLote({ nombre: 'Lote 1', areaHa: 2.5, tipoCultivo: 'Caturra' });
    expect(r.valido).toBe(true);
    expect(r.errores).toHaveLength(0);
  });

  it('UNIT-03 rechaza un nombre vacío', () => {
    const r = validarLote({ nombre: '   ', areaHa: 1, tipoCultivo: 'Caturra' });
    expect(r.valido).toBe(false);
    expect(r.errores[0]).toMatch(/nombre/i);
  });

  it('UNIT-04 rechaza área 0 (valor límite) y acepta el mínimo 0.01', () => {
    const cero = validarLote({ nombre: 'L', areaHa: 0, tipoCultivo: 'Castillo' });
    const minimo = validarLote({ nombre: 'L', areaHa: 0.01, tipoCultivo: 'Castillo' });
    expect(cero.valido).toBe(false);
    expect(minimo.valido).toBe(true);
  });

  it('UNIT-05 acepta un nombre de 100 caracteres y rechaza uno de 101', () => {
    const justo = validarLote({ nombre: 'a'.repeat(100), areaHa: 1, tipoCultivo: 'X' });
    const excede = validarLote({ nombre: 'a'.repeat(101), areaHa: 1, tipoCultivo: 'X' });
    expect(justo.valido).toBe(true);
    expect(excede.valido).toBe(false);
  });

  it('UNIT-06 acumula varios errores a la vez', () => {
    const r = validarLote({ nombre: '', areaHa: -1, tipoCultivo: '' });
    expect(r.errores).toHaveLength(3);
  });
});
