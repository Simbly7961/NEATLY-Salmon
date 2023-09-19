//localhost:3000/register
"use client";
import { useEffect, useState } from "react";
import countryData from "../components/countryData.json";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Avatar from "./Avatar";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import useUserAddress from "@/lib/getUsers";
import { useUser } from "@/context/user";
import axios from "axios";
import Image from "next/image";

export default function ProfileUP({ session }) {
  const [formErrors, setFormErrors] = useState({
    full_name: "",
    email: "",
    birthdate: "",
    id_card: "",
    country: "",
    avatar_url: "",
  });

  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [full_name, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [id_card, setIdNumber] = useState("");
  const [country, setCountry] = useState("");
  const [avatar_url, setAvatar] = useState("");
  const [countries, setCountries] = useState([]);
  const [formError, setFormError] = useState(null);
  const [showPicture, setShowPicture] = useState(true);

  const router = useRouter();

  const handleDelete = async () => {
    const url = avatar_url.split("?")[0];
    const pic = url.split("/");
    const result = pic[pic.length - 1];
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .remove([result]);
      setShowPicture(!showPicture);
      setAvatar(null);
    } catch (error) {}
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        console.log("data:", data);
        if (error) {
          alert(error.message);
        }
        if (data.session === null) {
          window.location.href = "/login";
        } else {
          setUser(data.session.user);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching login status:", error);
      }
    };
    checkLoginStatus();
  }, []);

  useEffect(() => {
    const fetchSmoothie = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`full_name, email, id_card, birthdate, country,avatar_url`)
        .eq("id", user?.id)
        .single();
      if (error) {
        throw error;
      }
      if (data) {
        setFullname(data.full_name);
        setEmail(data.email);
        setIdNumber(data.id_card);
        setBirthdate(data.birthdate);
        setCountry(data.country);
        setAvatar(data.avatar_url);
      }
    };

    fetchSmoothie();
  }, [user?.id]);

  useEffect(() => {
    const data = countryData;
    setCountries(data);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {
      full_name: "",
      email: "",
      birthdate: "",
      id_card: "",
      country: "",
      avatar_url: "",
    };

    if (!full_name) {
      errors.full_name = "Please enter your full name";
    } else {
      const nameParts = full_name.split(" ");
      if (nameParts.length < 2) {
        errors.full_name =
          "Please enter both your first name and surname separated by a space";
      }
    }

    if (!email) {
      errors.email = "Please enter your email";
    }

    if (!birthdate) {
      errors.birthdate = "Please enter your birthdate";
    } else {
      const birthDate = new Date(birthdate);
      const currentDate = new Date();
      const age = currentDate.getFullYear() - birthDate.getFullYear();

      if (age < 18) {
        errors.birthdate = "You are under 18 years old";
      }
    }

    if (!id_card) {
      errors.id_card = "Please enter your ID card number";
    } else if (id_card.length !== 13) {
      errors.id_card = "ID card number must be exactly 13 characters";
    }

    if (!country) {
      errors.country = "Please select your country";
    }

    if (!avatar_url) {
      errors.avatar_url = "Please upload your profile picture";
    }

    setFormErrors(errors); // Update individual field errors

    // Only submit the form if there are no errors
    if (
      !errors.full_name &&
      !errors.email &&
      !errors.birthdate &&
      !errors.id_card &&
      !errors.country &&
      !errors.avatar_url
    ) {
      const { data, error } = await supabase
        .from("profiles")
        .update({ full_name, email, id_card, birthdate, country, avatar_url })
        .eq("id", user?.id)
        .select();

      if (error || data === "undefined") {
        console.log(error);
        // You can set a general form error here
        setFormError("Please fill in all fields correctly");
      }
      if (data) {
        console.log(data);
        console.log(data[0].avatar_url);
        alert("UPDATED PROFILE SUCCESSFULLY");
        setFormErrors({
          full_name: "",
          email: "",
          birthdate: "",
          id_card: "",
          country: "",
          avatar_url: "",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="relative max-w-[1440px] h-[1087px] pt-[80px] pb-[167px]  pl-[250px] pr-[250px]  bg-slate-50  ">
        <div className="flex flex-col gap-12 ">
          <div className="flex justify-between">
            <h1 className="font-mono font-medium text-[68px] leading-[85px] text-green-800">
              Profile
            </h1>

            <div>
              <Button
                className={`${buttonVariants({
                  variant: "primary",
                })} w-[176px] h-[48px] mx-8  `}
              >
                {loading ? `Loading...` : `Update Profile`}
              </Button>
            </div>
          </div>
          <div>
            <h4 className="font-sans  font-semibold text-[20px] leading-[30px] text-gray-600  pb-10">
              Basic Information
            </h4>
          </div>
        </div>

        <div className="w-full ">
          <label className="" htmlFor="fullName">
            Full Name
          </label>
          <input
            className={`w-full h-[48px] bg-white border-[1px] placeholder-slate-400 rounded p-[12px] focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:shadow-none text-blue-800 border-gray-400 ${
              formErrors.full_name ? "border-red-500 ring-red-500 ring-1" : ""
            }`}
            id="fullName"
            type="text"
            value={full_name}
            onChange={(e) => setFullname(e.target.value)}
          />
          <p className="text-red-500 error">{formErrors.full_name}</p>
        </div>

        <div className="grid md:grid-cols-[52%_52%] ">
          <div className="flex flex-col w-full gap-2 mt-10 md:w-11/12">
            <label htmlFor="email">E-mail</label>
            <input
              className={`w-full h-[48px] bg-white border-[1px] placeholder-slate-400 rounded p-[12px] focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:shadow-none text-blue-800 border-gray-400 ${
                formErrors.email ? "border-red-500 ring-red-500 ring-1" : ""
              }`}
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-red-500 error">{formErrors.email}</p>
          </div>

          <div className="flex flex-col gap-2 mt-10 md:w-11/12">
            <label htmlFor="id_card">ID Number</label>
            <input
              className={`w-full h-[48px] bg-white border-[1px] placeholder-slate-400 rounded p-[12px] focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:shadow-none text-blue-800 border-gray-400 ${
                formErrors.id_card ? "border-red-500 ring-red-500 ring-1" : ""
              }`}
              id="id_card"
              value={id_card}
              onChange={(e) => setIdNumber(e.target.value)}
            />
            <p className="text-red-500 error">{formErrors.id_card}</p>
          </div>

          <div className="flex flex-col w-full gap-2 mt-10 md:w-11/12">
            <label htmlFor="dateBirth">Date of Birth</label>
            <input
              className={`w-full h-[48px] bg-white border-[1px] placeholder-slate-400 rounded p-[12px] focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:shadow-none text-black border-gray-400 ${
                formErrors.birthdate ? "border-red-500 ring-red-500 ring-1" : ""
              }`}
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />
            <p className="text-red-500 error">{formErrors.birthdate}</p>
          </div>

          <div className="flex flex-col gap-2 mt-10 md:w-11/12">
            <label htmlFor="country">Country</label>
            <select
              className={`w-full h-[48px] bg-white border-[1px] placeholder-slate-400 rounded p-[12px] focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:shadow-none text-blue-800 border-gray-400 ${
                formErrors.country ? "border-red-500 ring-red-500 ring-1" : ""
              }`}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="">Select your country</option>
              {countries.map((item) => (
                <option key={item.country}>{item.country}</option>
              ))}
            </select>
            <p className="text-red-500 error">{formErrors.country}</p>
          </div>
        </div>

        <div className="bg-gray-400 h-[1px] w-full mt-10 mb-10"></div>

        <div className="flex flex-col justify-center ">
          <h1 className="mb-10">Profile Picture</h1>
          <div>
            {showPicture ? (
              <div className="relative w-fit">
                <Image
                  className="object-cover cursor-pointer w-44 h-44"
                  alt="avatar"
                  src={avatar_url}
                  width={150}
                  height={150}
                />
                <button
                  type="button"
                  onClick={handleDelete}
                  className="absolute px-3 py-1 font-bold text-white bg-orange-500 rounded-full -right-4 -top-4"
                >
                  X
                </button>
              </div>
            ) : (
              <div className="bg-gray-200  hover:bg-gray-400 w-[180px] h-[180px] flex flex-col justify-center items-center cursor-pointer border border-gray-800">
                <Avatar
                  url={avatar_url}
                  size={150}
                  onUpload={(url) => {
                    setAvatar(url);
                  }}
                  setAvatar={setAvatar}
                />
              </div>
            )}
          </div>
        </div>

        {formError && <p className="error">{formError}</p>}
      </div>
    </form>
  );
}