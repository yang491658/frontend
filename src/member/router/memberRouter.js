import { lazy, Suspense } from "react";
import { Navigate } from "react-router";
import Loading from "../etc/Loading";

const Login = lazy(() => import("../component/LoginComponent"));

const Choice = lazy(() => import("../component/ChoiceComponent"));
const Agree = lazy(() => import("../component/AgreeComponent"));
const General = lazy(() => import("../component/GeneralComponent"));
const Business = lazy(() => import("../component/BusinessComponent"));

const FindId = lazy(() => import("../component/FindIdComponent"));
const FindPw = lazy(() => import("../component/FindPwComponent"));

const memberRouter = () => {
  return [
    {
      path: "login",
      element: (
        <Suspense fallback={<Loading />}>
          <Login />
        </Suspense>
      ),
    },
    {
      path: "signup",
      element: <Navigate replace to="choice" />,
    },
    {
      path: "signup/choice",
      element: (
        <Suspense fallback={<Loading />}>
          <Choice />
        </Suspense>
      ),
    },
    {
      path: "signup/agree",
      element: (
        <Suspense fallback={<Loading />}>
          <Agree />
        </Suspense>
      ),
    },
    {
      path: "signup/general",
      element: (
        <Suspense fallback={<Loading />}>
          <General />
        </Suspense>
      ),
    },
    {
      path: "signup/business",
      element: (
        <Suspense fallback={<Loading />}>
          <Business />
        </Suspense>
      ),
    },
    {
      path: "findid",
      element: (
        <Suspense fallback={<Loading />}>
          <FindId />
        </Suspense>
      ),
    },
    {
      path: "findpw",
      element: (
        <Suspense fallback={<Loading />}>
          <FindPw />
        </Suspense>
      ),
    },
  ];
};

export default memberRouter;
