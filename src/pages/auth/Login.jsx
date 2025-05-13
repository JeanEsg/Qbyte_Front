import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { RiEyeFill, RiEyeOffFill } from "react-icons/ri";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const credencial = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = credencial.user;

      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError("No se encontró información del usuario en la base de datos.");
        return;
      }

      const userData = docSnap.data();
      const { rol } = userData;

      if (rol === "auditor_interno" || rol === "auditor_externo") {
        try {
          const endpoint =
            rol === "auditor_interno"
              ? "/auditor_interno/logear_auditor_interno"
              : "/auditor_externo/logear_auditor_externo";

          const response = await fetch(`http://localhost:8000${endpoint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ usuario: email, contraseña: password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            setError("Error de backend: " + errorData.detail);
            return;
          }

          login({ uid: user.uid, email: user.email, rol });

          navigate("/index", { replace: true });
        } catch (err) {
          setError("Error al conectar con el backend: " + err.message);
        }
      } else {
        login({ uid: user.uid, email: user.email, rol });
        navigate("/index", { replace: true });
      }
    } catch (err) {
      setError("Error al iniciar sesión: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center relative">
      <img
        src="https://images.unsplash.com/photo-1530533609496-06430e875bbf?fm=jpg&q=100&w=1920"
        alt="Fondo espacial"
        className="absolute inset-0 w-full h-full object-cover -z-10"
      />

      <Link to="/" className="absolute m-10 z-50 top-[1%] left-[2%]">
        <FaArrowLeft className="text-3xl xl:text-4xl text-white rounded-full" />
      </Link>

      <div className="relative z-10 bg-white bg-opacity-10 rounded-xl shadow-xl p-6 max-w-xs w-full min-h-[420px] backdrop-blur-md border border-white/20">
        <h2 className="text-center text-3xl italic tracking-wide font-bold text-white mb-5">
          Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <input
              className="w-full p-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2"
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <i className="absolute right-3 top-2 text-white">👤</i>
          </div>

          <div className="mb-4 relative">
            <input
              className="w-full py-2 px-8 rounded-lg bg-white bg-opacity-20 text-white placeholder-white focus:outline-none focus:ring-2"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i className="absolute right-3 top-2 text-white">🔒</i>
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

          <div className="mb-2 text-white text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Terminos y condiciones
            </label>
          </div>

          <div className="mb-4 text-right">
            <a href="#" className="text-white text-sm hover:underline">
              ¿Has olvidado tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-[#133D87] hover:bg-[#2b5399] text-white p-2 rounded-lg font-semibold transition-colors duration-300"
          >
            Iniciar Sesión
          </button>
        </form>

        {error && (
          <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
        )}

        <p className="text-center text-white text-sm mt-4">
          ¿No tienes una cuenta?{" "}
          <Link to="/Sign" className="underline text-white hover:text-blue-300">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
