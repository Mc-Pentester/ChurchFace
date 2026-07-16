"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({
  isOpen,
  onClose,
}: Props) {

  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");



  if (!isOpen) return null;



  // =========================
  // LOGIN
  // =========================

  const handleLogin = async () => {

    try {

      setLoading(true);
      setError("");

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });


      console.log("LOGIN RESULT:", result);


      if (result?.error) {

        setError(
          "Email ou mot de passe incorrect"
        );

        return;
      }


      onClose();


    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );

      setError(
        "Erreur de connexion"
      );

    } finally {

      setLoading(false);

    }

  };





  // =========================
  // REGISTER
  // =========================

  const handleRegister = async () => {

    try {

      setLoading(true);
      setError("");

      console.log("BEFORE REGISTER");


      const response = await fetch(
        "/api/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,
          }),

        }
      );


      console.log(
        "REGISTER STATUS:",
        response.status
      );



      const text = await response.text();


      console.log(
        "REGISTER RAW RESPONSE:",
        text
      );



      let data;


      try {

        data = JSON.parse(text);

      } catch {

        console.error(
          "NOT JSON RESPONSE"
        );

        setError(
          "Réponse serveur invalide"
        );

        return;

      }




      console.log(
        "REGISTER DATA:",
        data
      );




      if (!response.ok) {

        setError(
          data.error ||
          "Erreur inscription"
        );

        return;

      }





      console.log(
        "USER CREATED:",
        data
      );




      // =========================
      // AUTO LOGIN
      // =========================


      const login = await signIn(
        "credentials",
        {
          email,
          password,
          redirect:false,
        }
      );



      console.log(
        "AUTO LOGIN:",
        login
      );



      if (login?.error) {

        setError(
          "Compte créé mais connexion impossible"
        );

        return;

      }



      onClose();



    } catch(error) {


      console.error(
        "REGISTER ERROR:",
        error
      );


      setError(
        "Erreur serveur"
      );


    } finally {

      setLoading(false);

    }

  };





  return (

    <div
      className="
        fixed
        inset-0
        z-50
        bg-black/60
        backdrop-blur-sm
        flex
        items-center
        justify-center
        p-4
      "
    >


      <div
        className="
          w-full
          max-w-md
          bg-white
          rounded-3xl
          shadow-2xl
          p-8
          relative
        "
      >



        <button
          onClick={onClose}
          className="
            absolute
            top-4
            right-4
            text-gray-400
            hover:text-black
            text-2xl
          "
        >
          ×
        </button>




        <div className="text-center mb-6">

          <h1
            className="
              text-4xl
              font-extrabold
              text-emerald-600
            "
          >
            ChurchFace
          </h1>


          <p className="text-gray-500 mt-2">
            Réseau social chrétien moderne
          </p>


        </div>





        <div
          className="
            flex
            bg-gray-100
            rounded-xl
            p-1
            mb-6
          "
        >

          <button
            onClick={() => setIsRegister(false)}
            className={`
              flex-1
              py-2
              rounded-lg
              font-medium
              ${
                !isRegister
                ? "bg-white shadow text-emerald-600"
                : "text-gray-500"
              }
            `}
          >
            Connexion
          </button>



          <button
            onClick={() => setIsRegister(true)}
            className={`
              flex-1
              py-2
              rounded-lg
              font-medium
              ${
                isRegister
                ? "bg-white shadow text-emerald-600"
                : "text-gray-500"
              }
            `}
          >
            Inscription
          </button>


        </div>





        {error && (

          <div
            className="
              mb-4
              bg-red-100
              text-red-600
              p-3
              rounded-xl
              text-sm
            "
          >
            {error}
          </div>

        )}






        <div className="space-y-4">



          {isRegister && (

            <input
              type="text"
              placeholder="Nom complet"
              value={name}
              onChange={
                e => setName(e.target.value)
              }
              className="
                w-full
                bg-gray-100
                p-4
                rounded-xl
              "
            />

          )}




          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={
              e => setEmail(e.target.value)
            }
            className="
              w-full
              bg-gray-100
              p-4
              rounded-xl
            "
          />




          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={
              e => setPassword(e.target.value)
            }
            className="
              w-full
              bg-gray-100
              p-4
              rounded-xl
            "
          />





          <button
            disabled={loading}
            onClick={
              isRegister
              ? handleRegister
              : handleLogin
            }
            className="
              w-full
              bg-emerald-600
              hover:bg-emerald-700
              text-white
              p-4
              rounded-xl
              font-semibold
              disabled:opacity-50
            "
          >

            {
              loading
              ? "Chargement..."
              : isRegister
              ? "Créer un compte"
              : "Se connecter"
            }

          </button>



        </div>


      </div>


    </div>

  );
}