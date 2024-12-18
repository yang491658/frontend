import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCookie, setCookie } from "../../../etc/util/cookieUtil";
import { sendMail, modify } from "../../api/memberAPI";
import useMemberTag from "../../hook/useMemberTag";
import Loading from "../../../etc/component/Loading";

const initState = {
  userId: "",
  authCode: "",
  userPw: "",
  confirmPw: "",
  roleName: "GENERAL",
};

const FindPw = () => {
  const navigate = useNavigate();
  const { makeBtn2, makeAdd, makeInput } = useMemberTag();
  const [loading, setLoading] = useState(false);

  const [member, setMember] = useState(initState);

  const [validation, setValidation] = useState({
    isMailSent: false,
    authCode: 0,
    isAuth: false,
  });

  const refList = {
    userId: useRef(null),
    authCode: useRef(null),
    userPw: useRef(null),
    confirmPw: useRef(null),
  };

  useEffect(() => {
    if (getCookie("foundId"))
      setMember({ ...member, userId: getCookie("foundId") });
  }, []);

  const onChange = ({ target: { name, value } }) => {
    if (name === "userId") {
      setValidation({
        ...validation,
        isIdValid: false,
        isMailSent: false,
        authCode: 0,
        isAuth: false,
      });
    }
    setMember({ ...member, [name]: value });
  };

  const onClikSend = async () => {
    setLoading(true);

    try {
      const code = await sendMail(member);
      setValidation({
        ...validation,
        isMailSent: true,
        authCode: code,
      });
      toast.success("메일 전송 성공");
    } catch (error) {
      toast.error("메일 전송에 실패했습니다.");
    }

    setLoading(false);
  };

  const onClickAuth = () => {
    setLoading(true);

    if (validation.authCode === member.authCode * 1) {
      setValidation({ ...validation, isAuth: true });
      toast.success("인증 완료");
    } else {
      toast.warn("코드를 다시 입력하세요.");
      refList.authCode.current.focus();
    }

    setLoading(false);
  };

  const validField = () => {
    const validList = [
      [!member.userId, "아이디를 입력하세요.", refList.userId],
      [
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.userId),
        "올바르지 못한 아이디입니다. (example@domain.com)",
        refList.userId,
        "userId",
      ],
      [!validation.isMailSent, "메일 전송을 누르세요."],
      [!member.authCode, "인증코드를 입력하세요.", refList.authCode],
      [!validation.isAuth, "이메일 인증을 완료하세요."],
      [!member.userPw, "비밀번호를 입력하세요.", refList.userPw],
      [
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,16}$/.test(
          member.userPw
        ),
        "올바르지 못한 비밀번호입니다. (영어 대소문자, 숫자, 특수기호 포함, 8~16글자)",
        refList.userPw,
        "userPw",
      ],
      [!member.confirmPw, "비밀번호 확인을 입력하세요.", refList.confirmPw],
      [
        member.confirmPw !== member.userPw,
        "입력하신 비밀번호가 다릅니다.",
        refList.confirmPw,
        "confirmPw",
      ],
    ];

    for (const [condition, message, ref, err] of validList) {
      if (condition) {
        err ? toast.error(message) : toast.warn(message);
        if (err === "userId") {
          setMember({ ...member, userId: "" });
        } else if (err === "userPw") {
          setMember({ ...member, userPw: "" });
        } else if (err === "confirmPw") {
          setMember({ ...member, confirmPw: "" });
        }
        ref?.current?.focus();
        return false;
      }
    }
    return true;
  };

  const onClickModify = async () => {
    setLoading(true);

    if (!validField()) return setLoading(false);

    await modify(member)
      .then(() => {
        setCookie("userId", member.userId);
        setCookie("userRole", member.roleName);

        navigate("/member/login", { replace: true });
        setTimeout(() => {
          toast.success("비밀번호 변경 완료");
        }, 100);
      })
      .catch((error) => {
        if (error.code === "ERR_NETWORK") {
          toast.error("서버연결에 실패했습니다.");
        } else {
          setMember({ ...member, userPw: "", confirmPw: "" });
          toast.warn("비밀번호 변경 실패, 다시 입력하세요.");
        }
      });

    setLoading(false);
  };

  return (
    <>
      {loading && <Loading />}
      <div className="w-1/2 h-[80%] px-10 py-4 border-2 border-gray-300 rounded shadow-xl text-base text-center font-bold flex flex-col justify-center items-center">
        <div className="w-full h-[20%] text-3xl flex justify-center items-center">
          비밀번호 {!validation.isAuth ? " 찾기" : " 변경"}
        </div>

        {!validation.isAuth ? (
          <>
            <div className="w-full h-[10%] flex flex-col justify-center items-center">
              <div className="w-full h-1/2">
                회원정보에 등록된 정보로 비밀번호를 찾을 수 있습니다.
              </div>
              <div className="w-full h-1/2 text-gray-500">
                ※ 기업계정은 관리자에게 문의바랍니다.
              </div>
            </div>

            <div className="w-full h-[35%] px-10 flex flex-col justify-center items-center space-y-4">
              {/* 아이디 */}
              {makeAdd(
                "아이디",
                <div className="w-full h-full flex justify-center items-center space-x-1">
                  {makeInput(
                    "email",
                    "userId",
                    member.userId,
                    "이메일",
                    refList.userId,
                    onChange,
                    !validation.isAuth
                  )}
                </div>
              )}

              {/* 인증번호 */}
              {makeAdd(
                "인증번호",
                makeInput(
                  "text",
                  "authCode",
                  member.authCode,
                  "인증번호",
                  refList.authCode,
                  onChange,
                  validation.isMailSent
                )
              )}
            </div>
          </>
        ) : (
          <>
            <div className="w-full h-[10%] flex flex-col justify-center items-center">
              <div className="w-full h-1/2">인증이 완료되었습니다.</div>
              <div className="w-full h-1/2">변경할 비밀번호를 입력하세요.</div>
            </div>

            <div className="w-full h-[35%] px-10 flex flex-col justify-center items-center space-y-4">
              {/* 비밀번호 */}
              {makeAdd(
                "비밀번호",
                makeInput(
                  "password",
                  "userPw",
                  member.userPw,
                  "영어 대소문자, 숫자, 특수기호를 포함한 8~16글자",
                  refList.userPw,
                  onChange,
                  validation.isAuth
                )
              )}
              {/* 비밀번호 확인 */}
              {makeAdd(
                "비밀번호 확인",
                makeInput(
                  "password",
                  "confirmPw",
                  member.confirmPw,
                  "비밀번호 재입력",
                  refList.confirmPw,
                  onChange,
                  validation.isAuth
                )
              )}
            </div>
          </>
        )}

        <div className="w-full h-[35%] px-10 flex flex-col justify-center items-center space-y-4">
          {!validation.isMailSent
            ? makeBtn2("메일 전송", onClikSend)
            : !validation.isAuth
            ? makeBtn2("인증 확인", onClickAuth)
            : makeBtn2("변경 완료", onClickModify)}
          {makeBtn2("뒤로가기", () => {
            setCookie("userId", member.userId);
            setCookie("userRole", member.roleName);
            navigate("/member/login", { replace: true });
          })}
        </div>
      </div>
    </>
  );
};

export default FindPw;
