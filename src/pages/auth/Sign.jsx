import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link } from "react-router-dom";
import { auth } from "../../../firebaseConfig";
import { FaArrowLeft } from "react-icons/fa6";
import { RiEyeFill, RiEyeOffFill } from "react-icons/ri";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { useAuth } from "../../context/AuthContext";

function Sign() {
  const [name, setName] = useState("");
  const [rol, setRol] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [compania, setCompania] = useState("");
  const { login } = useAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (rol === "admin") {
        const codeRef = doc(db, "adminCodes", "adminAccess");
        const codeSnap = await getDoc(codeRef);

        if (
          !codeSnap.exists() ||
          String(codeSnap.data().codigo) !== adminCode.trim()
        ) {
          setError("Código de administrador incorrecto.");
          return;
        }
      }

      const credencial = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = credencial.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        name: name,
        email: email,
        rol: rol,
        ...(rol === "auditor_interno" && { compania: compania }),
      });
      login({ name, email, uid: user.uid, rol });

      if (rol === "auditor_externo") {
        const externoPayload = {
          nombre: name,
          usuario: email,
          contraseña: password,
        };

        const res = await fetch(
          "http://localhost:8000/auditor_externo/crear_auditor_externo",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(externoPayload),
          }
        );

        if (!res.ok) {
          setError("Error al registrar auditor interno.");
        }
      }

      if (rol === "auditor_interno") {
        const internoPayload = {
          nombre: name,
          compañia: compania,
          usuario: email,
          contraseña: password,
        };

        const res = await fetch(
          "http://localhost:8000/auditor_interno/crear_auditor_interno",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(internoPayload),
          }
        );

        if (!res.ok) {
          setError("Error al registrar auditor interno.");
        }
      }
    } catch (err) {
      setError("Error al registrarse: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center relative">
      <img
        src="https://cdn.pixabay.com/photo/2017/06/14/01/43/background-2400765_1280.jpg"
        alt="Fondo"
        className="absolute inset-0 w-full h-full object-cover -z-10"
      />
      <Link to="/" className="absolute m-10 z-50 top-[1%] left-[2%]">
        <FaArrowLeft className="text-3xl xl:text-4xl text-white rounded-full" />
      </Link>

      <div className="relative z-10 bg-white bg-opacity-5 shadow-white rounded-xl p-6 max-w-xs w-full min-h-[420px] backdrop-blur-md border border-sky-800">
        <h2 className="text-center text-3xl italic tracking-wide font-bold text-white mb-5">
          Sign Up
        </h2>

        <form onSubmit={handleSignUp}>
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2"
            />
            <i className="absolute right-3 top-2 text-white">👤</i>
          </div>
          <div className="mb-4 relative">
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              required
              className="w-full p-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2 appearance-none"
            >
              <option value="">Seleccione un rol</option>
              <option value="auditor_interno" className="text-black">
                Auditor Interno
              </option>
              <option value="auditor_externo" className="text-black">
                Auditor Externo
              </option>
              <option value="admin" className="text-black">
                Administrador
              </option>
            </select>
            <i className="absolute right-3 top-2 text-white pointer-events-none">
              🔏
            </i>
          </div>

          {rol === "auditor_interno" && (
            <div className="mb-4 relative">
              <input
                type="text"
                placeholder="Nombre de la compañía"
                value={compania}
                onChange={(e) => setCompania(e.target.value)}
                required
                className="w-full p-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2"
              />
              <i className="absolute right-3 top-2 text-white">🏢</i>
            </div>
          )}

          {rol === "admin" && (
            <div className="mb-4 relative">
              <input
                type="text"
                placeholder="Código"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                required
                className="w-full p-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2"
              />
              <i className="absolute right-3 top-2 text-white">🔐</i>
            </div>
          )}

          <div className="mb-4 relative">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2"
            />
            <i className="absolute right-3 top-2 text-white">📧</i>
          </div>

          <div className="mb-4 relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full py-2 px-8 rounded-lg bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2"
            />
            <i className="absolute right-3 top-2 text-white">🔐</i>
            {showPassword ? (
              <RiEyeOffFill
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3 left-2 text-[#161236] hover:cursor-pointer"
              />
            ) : (
              <RiEyeFill
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3 left-2 text-[#161236] hover:cursor-pointer"
              />
            )}
          </div>

          <button
            type="submit"
            className="w-full text-white p-2 rounded-lg font-semibold
             bg-gradient-to-r from-sky-800 to-sky-950
             hover:from-sky-700 hover:to-sky-900
             active:scale-95 active:from-sky-900 active:to-sky-950
             transition-all duration-200 ease-in-out shadow-md hover:shadow-lg active:shadow-inner"
          >
            Crear cuenta
          </button>
        </form>

        {error && (
          <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
        )}
        {success && (
          <p className="text-green-400 text-sm mt-3 text-center">{success}</p>
        )}

        <p className="text-center text-white text-sm mt-4">
          ¿Ya tienes una cuenta?{" "}
          <Link
            to="/login"
            className="underline text-white hover:text-blue-300"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Sign;
