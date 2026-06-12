import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { loginAsync } from "../store/services/authService.js";
import { setLoginStatus } from "../store/slices/authSlice.js";
import { asyncStatus } from "../utils/asyncStatus";
import { getValidationSchema } from "../utils/validationSchema.js";
import { ButtonLoader } from "../components/Loading.jsx";
import Logo from "../../public/logo.png";
import './style.css'

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { login_status, login_error } = useSelector((state) => state.auth);

  console.log("Redux login_status: ", login_status)
  console.log("Redux login_error: ", login_error)
  
  const loader = login_status === asyncStatus.LOADING;
  console.log("Redux loader: ", loader)

  useEffect(() => {
    if (login_status === asyncStatus.SUCCEEDED) {
      navigate("/dashboard", { replace: true });
      dispatch(setLoginStatus());
    }
  }, [login_status]);

  const initialValues = {
    email: "",
    password: "",
    // role: "super_admin",
  };

  const handleLogin = (values) => {
    dispatch(loginAsync({ email: values.email, password: values.password }));
  };

  return (
    <>
      <div className="root">

        {/* ── LEFT — Form ── */}
        <div className="left">
          <div className="form-box">
            <h1 className="title">Sign In</h1>
            <p className="subtitle">Enter your email and password to sign in!</p>

            {/* API Error Banner */}
            {/* {login_status === asyncStatus.ERROR && login_error && (
              <div className="error-banner">
                <span className="err-icon">!</span>
                {login_error}
              </div>
            )} */}

            <Formik
              initialValues={initialValues}
              validationSchema={getValidationSchema('login')}
              onSubmit={handleLogin}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <div>

                  {/* Role */}
                  {/* <div className="field">
                    <label className="label">
                      Role <span className="req">*</span>
                    </label>
                    <select
                      name="role"
                      className="input"
                      value={values.role}
                      onChange={handleChange("role")}
                      onBlur={handleBlur("role")}
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="location_manager">Location Manager</option>
                    </select>
                  </div> */}

                  {/* Email */}
                  <div className="field">
                    <label className="label">
                      Email <span className="req">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="info@gmail.com"
                      className={`input ${touched.email && errors.email ? "input-err" : ""}`}
                      value={values.email}
                      onChange={handleChange("email")}
                      onBlur={handleBlur("email")}
                      disabled={loader}
                    />
                    {touched.email && errors.email && (
                      <p className="err-text">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="field">
                    <label className="label">
                      Password <span className="req">*</span>
                    </label>
                    <div className="pw-wrap">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className={`input pw-input ${touched.password && errors.password ? "input-err" : ""}`}
                        value={values.password}
                        onChange={handleChange("password")}
                        onBlur={handleBlur("password")}
                      disabled={loader}
                      />
                      <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowPassword((p) => !p)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <p className="err-text">{errors.password}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="button"
                    className="submit-btn"
                    onClick={handleSubmit}
                  disabled={loader}
                  >
                    {loader ? (
                      <span className="btn-inner">
                        <ButtonLoader size={18} color="#ffffff" />
                        <span>Signing in...</span>
                      </span>
                    ) : (
                      "Sign in"
                    )}
                  </button>

                </div>
              )}
            </Formik>
          </div>
        </div>

        {/* ── RIGHT — Brand ── */}
        <div className="right">
          <div className="dots" />
          <img src={Logo} alt="BeLine Bus" className="bus-img" />
        </div>

      </div>
    </>
  );
};


export default Login;