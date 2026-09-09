import { useState } from "react";
import API from "../api/axios"; // 👈 Importamos Axios configurado
import { Eye, EyeOff } from "lucide-react";

const limitesCampos = {
  nombre: 50,
  apellido: 50,
  numeroDocumento: 12,
  direccion: 150,
  telefono: 10,
  email: 100,
  password: 50,
  confirmarPassword: 50,
};

export default function RegisterModal({ cerrarModal }) {
  const [formulario, setFormulario] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "",
    numeroDocumento: "",
    direccion: "",
    telefono: "",
    email: "",
    password: "",
    confirmarPassword: "",
  });

  const [errores, setErrores] = useState({});
  const [registrado, setRegistrado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const obtenerCaracteresRestantes = (campo) => {
    const maximo = limitesCampos[campo] ?? 0;
    return Math.max(maximo - (formulario[campo]?.length || 0), 0);
  };

  // ==============================
  // CAMBIO DE CAMPOS
  // ==============================

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    const valorNormalizado = ["numeroDocumento", "telefono"].includes(name)
      ? value.replace(/\D/g, "")
      : value;

    setFormulario((prev) => ({
      ...prev,
      [name]: valorNormalizado,
    }));

    setErrores((prev) => ({
      ...prev,
      [name]: "",
      ...(name === "password" && formulario.confirmarPassword
        ? {
            confirmarPassword:
              valorNormalizado === formulario.confirmarPassword
                ? ""
                : "Las contraseñas no coinciden.",
          }
        : {}),
    }));

    validarCampo(name, valorNormalizado);
  };

  // ==============================
  // VALIDACIÓN INDIVIDUAL
  // ==============================

  const validarCampo = (nombre, valor) => {
    let error = "";

    if (nombre === "nombre") {
      if (!valor.trim()) {
        error = "El nombre es obligatorio.";
      } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(valor)) {
        error = "El nombre solo puede contener letras.";
      } else if (valor.trim().length < 3) {
        error = "El nombre debe tener mínimo 3 caracteres.";
      }
    }

    if (nombre === "apellido") {
      if (!valor.trim()) {
        error = "El apellido es obligatorio.";
      } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(valor)) {
        error = "El apellido solo puede contener letras.";
      } else if (valor.trim().length < 3) {
        error = "El apellido debe tener mínimo 3 caracteres.";
      }
    }

    if (nombre === "tipoDocumento") {
      if (!valor) {
        error = "Selecciona un tipo de documento.";
      }
    }

    if (nombre === "numeroDocumento") {
      if (!valor.trim()) {
        error = "El número de documento es obligatorio.";
      } else if (!/^\d+$/.test(valor)) {
        error = "El documento solo puede contener números.";
      } else if (valor.length < 6 || valor.length > 12) {
        error = "El documento debe tener entre 6 y 12 números.";
      }
    }

    if (nombre === "direccion") {
      if (!valor.trim()) {
        error = "La dirección es obligatoria.";
      } else if (valor.trim().length < 5) {
        error = "Ingresa una dirección válida.";
      }
    }

    if (nombre === "telefono") {
      if (!valor.trim()) {
        error = "El teléfono es obligatorio.";
      } else if (!/^\d+$/.test(valor)) {
        error = "El teléfono solo puede contener números.";
      } else if (valor.length < 7 || valor.length > 10) {
        error = "El teléfono debe tener entre 7 y 10 números.";
      }
    }

    if (nombre === "email") {
      if (!valor.trim()) {
        error = "El correo electrónico es obligatorio.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
        error = "Ingresa un correo electrónico válido.";
      }
    }

    if (nombre === "password") {
      if (!valor) {
        error = "La contraseña es obligatoria.";
      } else if (valor.length < 8) {
        error = "La contraseña debe tener mínimo 8 caracteres.";
      }
    }

    if (nombre === "confirmarPassword") {
      if (!valor) {
        error = "Debes confirmar tu contraseña.";
      } else if (valor !== formulario.password) {
        error = "Las contraseñas no coinciden.";
      }
    }

    setErrores((prev) => ({
      ...prev,
      [nombre]: error,
    }));
  };

  // ==============================
  // VALIDAR TODO EL FORMULARIO
  // ==============================

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formulario.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formulario.nombre)) {
      nuevosErrores.nombre = "El nombre solo puede contener letras.";
    } else if (formulario.nombre.trim().length < 3) {
      nuevosErrores.nombre = "El nombre debe tener mínimo 3 caracteres.";
    }

    if (!formulario.apellido.trim()) {
      nuevosErrores.apellido = "El apellido es obligatorio.";
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formulario.apellido)) {
      nuevosErrores.apellido = "El apellido solo puede contener letras.";
    } else if (formulario.apellido.trim().length < 3) {
      nuevosErrores.apellido = "El apellido debe tener mínimo 3 caracteres.";
    }

    if (!formulario.tipoDocumento) {
      nuevosErrores.tipoDocumento = "Selecciona un tipo de documento.";
    }

    if (!formulario.numeroDocumento.trim()) {
      nuevosErrores.numeroDocumento = "El número de documento es obligatorio.";
    } else if (!/^\d+$/.test(formulario.numeroDocumento)) {
      nuevosErrores.numeroDocumento = "El documento solo puede contener números.";
    } else if (
      formulario.numeroDocumento.length < 6 ||
      formulario.numeroDocumento.length > 12
    ) {
      nuevosErrores.numeroDocumento = "El documento debe tener entre 6 y 12 números.";
    }

    if (!formulario.direccion.trim()) {
      nuevosErrores.direccion = "La dirección es obligatoria.";
    } else if (formulario.direccion.trim().length < 5) {
      nuevosErrores.direccion = "Ingresa una dirección válida.";
    }

    if (!formulario.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio.";
    } else if (!/^\d+$/.test(formulario.telefono)) {
      nuevosErrores.telefono = "El teléfono solo puede contener números.";
    } else if (
      formulario.telefono.length < 7 ||
      formulario.telefono.length > 10
    ) {
      nuevosErrores.telefono = "El teléfono debe tener entre 7 y 10 números.";
    }

    if (!formulario.email.trim()) {
      nuevosErrores.email = "El correo electrónico es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email)) {
      nuevosErrores.email = "Ingresa un correo electrónico válido.";
    }

    if (!formulario.password) {
      nuevosErrores.password = "La contraseña es obligatoria.";
    } else if (formulario.password.length < 8) {
      nuevosErrores.password = "La contraseña debe tener mínimo 8 caracteres.";
    }

    if (!formulario.confirmarPassword) {
      nuevosErrores.confirmarPassword = "Debes confirmar tu contraseña.";
    } else if (formulario.password !== formulario.confirmarPassword) {
      nuevosErrores.confirmarPassword = "Las contraseñas no coinciden.";
    }

    return nuevosErrores;
  };

  // ==============================
  // REGISTRAR USUARIO (API BACKEND)
  // ==============================

  const manejarRegistro = async (e) => {
    e.preventDefault();

    const nuevosErrores = validarFormulario();

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    const nuevoUsuario = {
      nombre: formulario.nombre.trim(),
      apellido: formulario.apellido.trim(),
      tipoDocumento: formulario.tipoDocumento,
      numeroDocumento: formulario.numeroDocumento.trim(),
      direccion: formulario.direccion.trim(),
      telefono: formulario.telefono.trim(),
      email: formulario.email.trim().toLowerCase(),
      password: formulario.password,
    };

    try {
      setCargando(true);
      setErrores({});

      // Petición POST al servidor backend
      await API.post("/auth/registro", nuevoUsuario);

      setRegistrado(true);
    } catch (error) {
      const mensajeError =
        error.response?.data?.error || "Ocurrió un error al registrar el usuario.";

      // Mapeo dinámico de errores devueltos por el backend
      if (mensajeError.toLowerCase().includes("correo")) {
        setErrores({ email: mensajeError });
      } else if (mensajeError.toLowerCase().includes("documento")) {
        setErrores({ numeroDocumento: mensajeError });
      } else {
        setErrores({ general: mensajeError });
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 px-6 py-10 backdrop-blur-sm"
      onClick={cerrarModal}
    >
      <div
        className="relative my-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-950 p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= CERRAR ================= */}

        <button
          type="button"
          onClick={cerrarModal}
          className="absolute right-5 top-5 text-2xl text-slate-500 transition hover:text-white"
          aria-label="Cerrar"
        >
          ×
        </button>

        {!registrado ? (
          <>
            {/* ================= TÍTULO ================= */}

            <div className="mb-7 text-center">
              <span className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
                Road Master
              </span>

              <h2 className="mt-3 text-3xl font-black text-white">
                Crear cuenta
              </h2>

              <p className="mt-3 text-sm text-slate-400">
                Regístrate para acceder a Road Master.
              </p>
            </div>

            {/* Error General desde el Backend */}
            {errores.general && (
              <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-400 border border-red-500/20">
                {errores.general}
              </div>
            )}

            {/* ================= FORMULARIO ================= */}

            <form onSubmit={manejarRegistro}>
              <div className="grid gap-4 md:grid-cols-2">
                {/* NOMBRE */}
                <div className="relative">
                  <label
                    htmlFor="nombre"
                    className="mb-2 block text-sm font-semibold text-slate-300"
                  >
                    Nombre
                  </label>

                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={formulario.nombre}
                    onChange={manejarCambio}
                    placeholder="Juan"
                    maxLength={50}
                    className={`w-full rounded-lg border ${
                      errores.nombre ? "border-red-500" : "border-white/10"
                    } bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-red-500`}
                  />

                  <p className="mt-1 text-xs text-slate-500">
                    {obtenerCaracteresRestantes("nombre")} caracteres restantes
                  </p>

                  {errores.nombre && (
                    <p className="mt-1 text-sm text-red-400">
                      {errores.nombre}
                    </p>
                  )}
                </div>

                {/* APELLIDO */}
                <div className="relative">
                  <label
                    htmlFor="apellido"
                    className="mb-2 block text-sm font-semibold text-slate-300"
                  >
                    Apellido
                  </label>

                  <input
                    id="apellido"
                    name="apellido"
                    type="text"
                    value={formulario.apellido}
                    onChange={manejarCambio}
                    placeholder="Miguel"
                    maxLength={50}
                    className={`w-full rounded-lg border ${
                      errores.apellido ? "border-red-500" : "border-white/10"
                    } bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-red-500`}
                  />

                  <p className="mt-1 text-xs text-slate-500">
                    {obtenerCaracteresRestantes("apellido")} caracteres restantes
                  </p>

                  {errores.apellido && (
                    <p className="mt-1 text-sm text-red-400">
                      {errores.apellido}
                    </p>
                  )}
                </div>

                {/* TIPO DOCUMENTO */}
                <div>
                  <label
                    htmlFor="tipoDocumento"
                    className="mb-2 block text-sm font-semibold text-slate-300"
                  >
                    Tipo de documento
                  </label>

                  <select
                    id="tipoDocumento"
                    name="tipoDocumento"
                    value={formulario.tipoDocumento}
                    onChange={manejarCambio}
                    className={`w-full rounded-lg border ${
                      errores.tipoDocumento ? "border-red-500" : "border-white/10"
                    } bg-slate-900 px-4 py-3 text-white outline-none focus:border-red-500`}
                  >
                    <option value="">Seleccionar</option>
                    <option value="CC">Cédula de ciudadanía</option>
                    <option value="CE">Cédula de extranjería</option>
                    <option value="TI">Tarjeta de identidad</option>
                  </select>

                  {errores.tipoDocumento && (
                    <p className="mt-1 text-sm text-red-400">
                      {errores.tipoDocumento}
                    </p>
                  )}
                </div>

                {/* DOCUMENTO */}
                <div>
                  <label
                    htmlFor="numeroDocumento"
                    className="mb-2 block text-sm font-semibold text-slate-300"
                  >
                    Número de documento
                  </label>

                  <input
                    id="numeroDocumento"
                    name="numeroDocumento"
                    type="text"
                    inputMode="numeric"
                    value={formulario.numeroDocumento}
                    onChange={manejarCambio}
                    placeholder="1234567890"
                    maxLength={12}
                    className={`w-full rounded-lg border ${
                      errores.numeroDocumento ? "border-red-500" : "border-white/10"
                    } bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-red-500`}
                  />

                  <p className="mt-1 text-xs text-slate-500">
                    {obtenerCaracteresRestantes("numeroDocumento")} caracteres restantes
                  </p>

                  {errores.numeroDocumento && (
                    <p className="mt-1 text-sm text-red-400">
                      {errores.numeroDocumento}
                    </p>
                  )}
                </div>

                {/* DIRECCIÓN */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="direccion"
                    className="mb-2 block text-sm font-semibold text-slate-300"
                  >
                    Dirección
                  </label>

                  <input
                    id="direccion"
                    name="direccion"
                    type="text"
                    value={formulario.direccion}
                    onChange={manejarCambio}
                    placeholder="Calle 123 # 45-67"
                    maxLength={150}
                    className={`w-full rounded-lg border ${
                      errores.direccion ? "border-red-500" : "border-white/10"
                    } bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-red-500`}
                  />

                  <p className="mt-1 text-xs text-slate-500">
                    {obtenerCaracteresRestantes("direccion")} caracteres restantes
                  </p>

                  {errores.direccion && (
                    <p className="mt-1 text-sm text-red-400">
                      {errores.direccion}
                    </p>
                  )}
                </div>

                {/* TELÉFONO */}
                <div>
                  <label
                    htmlFor="telefono"
                    className="mb-2 block text-sm font-semibold text-slate-300"
                  >
                    Teléfono
                  </label>

                  <input
                    id="telefono"
                    name="telefono"
                    type="text"
                    inputMode="numeric"
                    value={formulario.telefono}
                    onChange={manejarCambio}
                    placeholder="3001234567"
                    maxLength={10}
                    className={`w-full rounded-lg border ${
                      errores.telefono ? "border-red-500" : "border-white/10"
                    } bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-red-500`}
                  />

                  <p className="mt-1 text-xs text-slate-500">
                    {obtenerCaracteresRestantes("telefono")} caracteres restantes
                  </p>

                  {errores.telefono && (
                    <p className="mt-1 text-sm text-red-400">
                      {errores.telefono}
                    </p>
                  )}
                </div>

                {/* CORREO */}
                <div>
                  <label
                    htmlFor="registro-email"
                    className="mb-2 block text-sm font-semibold text-slate-300"
                  >
                    Correo electrónico
                  </label>

                  <input
                    id="registro-email"
                    name="email"
                    type="email"
                    value={formulario.email}
                    onChange={manejarCambio}
                    placeholder="correo@ejemplo.com"
                    maxLength={100}
                    className={`w-full rounded-lg border ${
                      errores.email ? "border-red-500" : "border-white/10"
                    } bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-red-500`}
                  />

                  <p className="mt-1 text-xs text-slate-500">
                    {obtenerCaracteresRestantes("email")} caracteres restantes
                  </p>

                  {errores.email && (
                    <p className="mt-1 text-sm text-red-400">
                      {errores.email}
                    </p>
                  )}
                </div>

                {/* CONTRASEÑA */}
                <div className="relative">
                  <label
                    htmlFor="registro-password"
                    className="mb-2 block text-sm font-semibold text-slate-300"
                  >
                    Contraseña
                  </label>

                  <input
                    id="registro-password"
                    name="password"
                    type={mostrarPassword ? "text" : "password"}
                    value={formulario.password}
                    onChange={manejarCambio}
                    placeholder="Mínimo 8 caracteres"
                    maxLength={50}
                    className={`w-full rounded-lg border ${
                      errores.password ? "border-red-500" : "border-white/10"
                    } bg-slate-900 px-4 py-3 pr-12 text-white outline-none placeholder:text-slate-600 focus:border-red-500`}
                  />
                  <button type="button" onClick={() => setMostrarPassword((visible) => !visible)} aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"} className="absolute right-3 top-9 text-slate-400 hover:text-white">
                    {mostrarPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>

                  <p className="mt-1 text-xs text-slate-500">
                    {obtenerCaracteresRestantes("password")} caracteres restantes
                  </p>

                  {errores.password && (
                    <p className="mt-1 text-sm text-red-400">
                      {errores.password}
                    </p>
                  )}
                </div>

                {/* CONFIRMAR CONTRASEÑA */}
                <div className="relative">
                  <label
                    htmlFor="confirmarPassword"
                    className="mb-2 block text-sm font-semibold text-slate-300"
                  >
                    Confirmar contraseña
                  </label>

                  <input
                    id="confirmarPassword"
                    name="confirmarPassword"
                    type={mostrarConfirmacion ? "text" : "password"}
                    value={formulario.confirmarPassword}
                    onChange={manejarCambio}
                    placeholder="Repite tu contraseña"
                    maxLength={50}
                    className={`w-full rounded-lg border ${
                      errores.confirmarPassword ? "border-red-500" : "border-white/10"
                    } bg-slate-900 px-4 py-3 pr-12 text-white outline-none placeholder:text-slate-600 focus:border-red-500`}
                  />
                  <button type="button" onClick={() => setMostrarConfirmacion((visible) => !visible)} aria-label={mostrarConfirmacion ? "Ocultar confirmación" : "Mostrar confirmación"} className="absolute right-3 top-9 text-slate-400 hover:text-white">
                    {mostrarConfirmacion ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>

                  <p className="mt-1 text-xs text-slate-500">
                    {obtenerCaracteresRestantes("confirmarPassword")} caracteres restantes
                  </p>

                  {errores.confirmarPassword && (
                    <p className="mt-1 text-sm text-red-400">
                      {errores.confirmarPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* ================= BOTÓN ================= */}

              <button
                type="submit"
                disabled={cargando}
                className="mt-6 w-full rounded-lg bg-red-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-red-600/20 transition hover:-translate-y-1 hover:bg-red-700 disabled:opacity-50"
              >
                {cargando ? "Registrando..." : "Crear cuenta"}
              </button>
            </form>
          </>
        ) : (
          /* ================= REGISTRO EXITOSO ================= */

          <div className="py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-3xl shadow-lg shadow-red-600/20">
              ✓
            </div>

            <h2 className="mt-6 text-3xl font-black">¡Cuenta creada!</h2>

            <p className="mt-4 leading-7 text-slate-400">
              Tu cuenta de Road Master ha sido creada correctamente en la base de datos.
            </p>

            <button
              type="button"
              onClick={cerrarModal}
              className="mt-7 rounded-lg bg-red-600 px-7 py-3 font-bold text-white transition hover:bg-red-700"
            >
              Continuar al Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}