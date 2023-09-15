//localhost:3000/register
"use client";

import "@/app/globals.css";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import countryData from "../components/countryData.json";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Avatar from "../components/Avatar.jsx";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import useUserAddress from "@/lib/getUsers";
// import { useUser } from "@/context/user";

export default function ProfileUpdate() {
  //   const [roomImage, setRoomImage] = useState([]);

  // const { user, id, email, picture } = useUser();
  // const [currentId, setCurrentId] = useState(0);

  const form = useForm();
  const { register, handleSubmit, formState, control } = form;
  const { errors } = formState;
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [avatar_url, setAvatar] = useState(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const onSubmit = async (data, e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    formData.append("dateBirth", data.dateBirth);
    formData.append("idNumber", data.idNumber);
    formData.append("country", data.country);

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.get("email"),
        password: formData.get("password"),
        options: {
          data: {
            full_name: formData.get("fullName"),
            email: formData.get("email"),
            birthdate: formData.get("dateBirth"),
            id_card: formData.get("idNumber"),
            country: formData.get("country"),
            avatar_url,
          },
        },
      });
      if (error) {
        alert(`Update profile Not Successfully`);
        setLoading(false);
      } else {
        alert(`update Profile Successfull`);
        setLoading(false);
        router.push("/login");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const data = countryData;
    setCountries(data);
  }, []);

  return (
    <div
      className="relative max-w-[1092px] h-[1000px] mx-auto pl-[50px] pr-[50px] pt-[50px]
             bg-slate-50 pb-[50px] my-12  "
    >
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
              Update Profie
            </Button>
          </div>
        </div>
        <div>
          <h4 className="font-sans  font-semibold text-[20px] leading-[30px] text-gray-600  pb-10">
            Basic Information
          </h4>
        </div>
      </div>
      {/* form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full ">
          <label className="" htmlFor="fullName">
            Full Name
          </label>
          <input
            className={`w-full h-[48px] bg-white border-[1px]
                        placeholder-slate-400 rounded p-[12px] focus:outline-none
                        focus:border-orange-400 focus:ring-1 focus:ring-orange-400
                        disabled:shadow-none text-blue-800 border-gray-400
                        ${
                          errors.userName &&
                          "border-red-500 ring-red-500 ring-1"
                        }`}
            type="text"
            id="fullName"
            placeholder="Enter your username"
            {...register("fullName", {
              required: {
                value: true,
                message: "* FullName is required.",
              },
              pattern: {
                value: /^[ก-๏\s].*\s[ก-๏\s]|[a-zA-Z].*\s[a-zA-z]+$/,
                message: "* Invalid Fullname.",
              },
            })}
          />
          <p className="text-red-500 error">{errors.fullName?.message}</p>
        </div>

        <div className="grid md:grid-cols-[52%_52%] ">
          <div className="flex flex-col w-full gap-2 mt-10 md:w-11/12">
            <label htmlFor="email">E-mail</label>

            <input
              className={`w-full h-[48px] bg-white border-[1px]
                            placeholder-slate-400 rounded p-[12px] focus:outline-none
                            focus:border-orange-400 focus:ring-1 focus:ring-orange-400
                            disabled:shadow-none text-blue-800 border-gray-400
                            ${
                              errors.userName &&
                              "border-red-500 ring-red-500 ring-1"
                            }`}
              type="email"
              id="email"
              placeholder="Enter your email"
              {...register("email", {
                required: {
                  value: true,
                  message: "* Email is required.",
                },
                pattern: {
                  value: /^[a-zA-Z0-9?^_`{|}~-]+@[a-zA-Z0-9-]+(\.[com]+)*$/,
                  message: "* Invalid email format.",
                },
                validate: {
                  notAdmin: (fieldValue) => {
                    return (
                      fieldValue !== "admin@example.com" ||
                      "* Enter a different email address."
                    );
                  },
                },
              })}
            />

            <p className="text-red-500 error">{errors.email?.message}</p>
          </div>

          <div className="flex flex-col gap-2 mt-10 md:w-11/12">
            <label htmlFor="idNumber">ID Number</label>
            <input
              className={`w-full h-[48px] bg-white border-[1px]
                            placeholder-slate-400 rounded p-[12px] focus:outline-none
                            focus:border-orange-400 focus:ring-1 focus:ring-orange-400
                            disabled:shadow-none text-blue-800 border-gray-400
                            ${
                              errors.userName &&
                              "border-red-500 ring-red-500 ring-1"
                            }`}
              type="idNumber"
              id="idNumber"
              placeholder="Enter your ID Number"
              {...register("idNumber", {
                required: {
                  value: true,
                  message: "* ID Number is required.",
                },
                minLength: {
                  value: 13,
                  message: "* ID Number less than 13 digit.",
                },
                maxLength: {
                  value: 13,
                  message: "* ID Number more than 13 digit.",
                },
              })}
            />
            <p className="text-red-500 error">{errors.idNumber?.message}</p>
          </div>

          {/* input date of birth */}
          <div className="flex flex-col w-full gap-2 mt-10 md:w-11/12">
            <label htmlFor="dateBirth">Date of Birth</label>
            <Controller
              name="dateBirth"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  className={`w-full h-[48px] bg-white border-[1px]
                                placeholder-slate-400 rounded p-[12px] focus:outline-none
                                focus:border-orange-400 focus:ring-1 focus:ring-orange-400
                                disabled:shadow-none text-black border-gray-400
                                ${
                                  errors.dateBirth &&
                                  "border-red-500 ring-red-500 ring-1"
                                }`}
                  type="date"
                  placeholder="dd-mm-yyyy"
                />
              )}
              rules={{
                required: "* Date of birth is required.",
                validate: (value) => {
                  const currentYear = new Date().getFullYear();
                  const year = value.split("-")[0];
                  const age = currentYear - year;
                  return age >= 18 || "* Your age must be at least 18.";
                },
              }}
            />
            <p className="text-red-500 error">{errors.dateBirth?.message}</p>
          </div>

          {/* input dropdrown menu country */}
          <div className="flex flex-col gap-2 mt-10 md:w-11/12">
            <label htmlFor="country">Country</label>
            <select
              className={`w-full h-[48px] bg-white border-[1px]
                            placeholder-slate-400 rounded p-[12px] focus:outline-none
                            focus:border-orange-400 focus:ring-1 focus:ring-orange-400
                            disabled:shadow-none text-blue-800 border-gray-400
                            ${
                              errors.userName &&
                              "border-red-500 ring-red-500 ring-1"
                            }`}
              {...register("country", {
                required: {
                  value: true,
                  message: "* Country is required.",
                },
              })}
            >
              <option value="">Select your country</option>
              {countries.map((item) => {
                return <option key={item.country}>{item.country}</option>;
              })}
            </select>
            <p className="text-red-500 error">{errors.country?.message}</p>
          </div>
        </div>

        <div className="bg-gray-400 h-[1px] w-full mt-10 mb-10"></div>

        <div className="flex flex-col justify-center ">
          <h1 className="mb-10">Profile Picture</h1>
          <Avatar
            url={avatar_url}
            size={150}
            onUpload={(url) => {
              setAvatar(url);
            }}
            setAvatar={setAvatar}
          />
        </div>
      </form>
    </div>
  );
}