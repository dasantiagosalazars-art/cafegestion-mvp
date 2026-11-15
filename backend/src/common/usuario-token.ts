/** Datos del usuario autenticado que viajan dentro del token (JWT). */
export class UsuarioToken {
  sub!: string;
  email!: string;
  fincaId!: string;
  rol!: string;
}
