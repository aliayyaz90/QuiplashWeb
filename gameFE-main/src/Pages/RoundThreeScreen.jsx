import roundTwo from "../assets/images/roundTwo.png";
import { Alert, Button, Col, Form, Input, Modal, Row } from "antd";
import React, { useEffect, useState } from "react";
import { getAsnwer, getStatus, submitAnswer } from "./request";
import { makeRequest } from "../helper/helper";
import ExitGame from "./ExitGame";
import { useNavigate } from "react-router-dom";
import CommonQuestions from "./CommonQuestions";
import Status from "./Status";
const RoundThreeScreen = () => {
  const [showImage, setShowImage] = useState(true);

  const [completeGame, setCompleteGame] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowImage(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);
  const navigate = useNavigate();
  const [LobbyIdAndRound, setLobbyIdAndRound] = useState([]);

  const [loader, setLoader] = useState("");
  const [answer, setAnswer] = useState([]);
  const [answerData, setanswerData] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [remainingTime, setRemainingTime] = useState(45);
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get("type");

  const round = urlParams.get("round");
  const code = urlParams.get("code");
  const id = urlParams.get("id");
  const userId = urlParams.get("userId");
  const lobbyId = urlParams.get("lobbyId");
  const saveAnswerToLocalStorage = (data) => {
    localStorage.setItem("answerData", JSON.stringify(data));
  };

  const getAnswerFromLocalStorage = () => {
    const storedData = localStorage.getItem("answerData");
    return storedData ? JSON.parse(storedData) : null;
  };

  useEffect(() => {
    if (id) {
      QuestionAnswer();
    } else {
      joinQuestionAnswer();
    }
    const storedAnswerData = getAnswerFromLocalStorage();
    if (storedAnswerData) {
      setAnswer(storedAnswerData.answer);
      setanswerData(storedAnswerData.answerData);
    }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnswer(true);
      setRemainingTime(45);
    }, 45000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (remainingTime > 0) {
        setRemainingTime((prevTime) => prevTime - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime]);
  useEffect(() => {
    if (remainingTime === 0) {
      if (type === "join") {
        const storedStartRoundId = JSON.parse(
          localStorage.getItem("startRoundId")
        );
        const storedUserId = JSON.parse(localStorage.getItem("UserId"));

        navigate(
          `/common-question?type=join&&round=${round}&&code=${code}&&startRoundId=${storedStartRoundId}&&userId=${storedUserId}`
        );
      } else {
        const storedStartRoundId = JSON.parse(
          localStorage.getItem("startRoundId")
        );

        navigate(
          `/common-question?round=${round}&&code=${code}&&startRoundId=${storedStartRoundId}&&id=${id}`
        );
      }
    }
  }, [remainingTime]);
  const QuestionAnswer = () => {
    let payload = {
      lobbyCode: code,
      round: round,
    };
    makeRequest(setLoader, getAsnwer, payload, onSuccess, onError);
  };
  const onSuccess = (res) => {


    const loop1Questions =
      res?.rounds[1]?.loop1.filter((item) => item.lobbyUserId === id) || [];
    const loop2Questions =
      res?.rounds[1]?.loop2.filter((item) => item.lobbyUserId === id) || [];

    setAnswer([...loop1Questions, ...loop2Questions]);
    setanswerData(res);
    saveAnswerToLocalStorage({
      answer: [...loop1Questions, ...loop2Questions],
      answerData: res,
    });
  };
  const onError = () => {};

  const joinQuestionAnswer = () => {
    let payload = {
      lobbyCode: code,
      round: round,
    };
    makeRequest(
      setLoader,
      getAsnwer,
      payload,
      onSuccessJoinAnswer,
      onErrorJoinAswer
    );
  };
  const onSuccessJoinAnswer = (res) => {

    const loop1Questions =
      res?.rounds[1]?.loop1.filter((item) => item.lobbyUserId === userId) || [];
    const loop2Questions =
      res?.rounds[1]?.loop2.filter((item) => item.lobbyUserId === userId) || [];

    setAnswer([...loop1Questions, ...loop2Questions]);
    setanswerData(res);
  };
  const onErrorJoinAswer = () => {};

  const onFinish = (payload) => {
    if (showAnswer === false) {
      let load = {
        ...payload,
        lobbyId: answerData?._id,
        // userId: answerData?.rounds[1]?.loop1[0]?.lobbyUserId,

        userId:
          type === "join"
            ? userId
            : answerData?.rounds[1]?.loop1[0]?.lobbyUserId,
        round: answerData?.rounds[2]?.round,
        loop: "1",
      };
      makeRequest(
        setLoader,
        submitAnswer,
        load,
        onSuccessAnswer,
        onErrorAnswer
      );
    } else {
      let load = {
        ...payload,
        lobbyId: answerData?._id,
        // userId: answerData?.rounds[1]?.loop1[0]?.lobbyUserId,

        userId:
          type === "join"
            ? userId
            : answerData?.rounds[1]?.loop1[0]?.lobbyUserId,
        round: answerData?.rounds[2]?.round,
        loop: "2",
      };
      makeRequest(
        setLoader,
        submitAnswer,
        load,
        onSuccessAnswerTwo,
        onErrorAnswer
      );
    }
  };

  const onSuccessAnswer = (res) => {
    setShowAnswer(true);
    setRemainingTime(45);
  };
  const onSuccessAnswerTwo = (res) => {
    setLobbyIdAndRound(res);
    setRemainingTime(45);

    if (type === "join") {
      const storedUserId = JSON.parse(localStorage.getItem("UserId"));
      const storedStartRoundId = JSON.parse(
        localStorage.getItem("startRoundId")
      );

      navigate(
        `/common-question?type=join&&round=${round}&&code=${code}&&startRoundId=${storedStartRoundId}&&userId=${storedUserId}&&checkAnswer=${res?.lobby?.isAnswersCompleted}`
      );
    } else {
      const storedStartRoundId = JSON.parse(
        localStorage.getItem("startRoundId")
      );
      navigate(
        `/common-question?round=${round}&&code=${code}&&startRoundId=${storedStartRoundId}&&id=${id}&&checkAnswer=${res?.lobby?.isAnswersCompleted}`
      );
    }
  };
  const onErrorAnswer = () => {};
  return (
    <div>
      <div className="center">
        <Row>
          <div className="form-box">
            <>
              {" "}
              <Row justify="center">
                <h1 className="questions">Round 3 - {remainingTime} seconds</h1>
              </Row>
              {!showAnswer ? (
                <>
                  {" "}
                  <h1 className="questions">{answer[0]?.question}</h1>
                  <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                      label="Your Answer"
                      name="answer"
                      className="custom-label"

                      // rules={[
                      //   {
                      //     required: true,
                      //     message: "Please input your password!",
                      //   },
                      // ]}
                    >
                      <Input className="input-field" />
                    </Form.Item>{" "}
                    <Row justify="end">
                      <Form.Item>
                        <Button
                          htmlType="submit"
                          className="create-btn-2"
                          loading={loader}
                        >
                          submit
                        </Button>
                      </Form.Item>
                    </Row>
                  </Form>
                </>
              ) : (
                <>
                  <h1 className="questions">{answer[1]?.question}</h1>
                  <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                      label="Your Answer"
                      name="answer"
                      className="custom-label"

                      // rules={[
                      //   {
                      //     required: true,
                      //     message: "Please input your password!",
                      //   },
                      // ]}
                    >
                      <Input className="input-field" />
                    </Form.Item>{" "}
                    <Row justify="end">
                      <Form.Item>
                        <Button
                          htmlType="submit"
                          className="create-btn-2"
                          loading={loader}
                        >
                          submit
                        </Button>
                      </Form.Item>
                    </Row>
                  </Form>
                </>
              )}
            </>
          </div>
          {/* )} */}
        </Row>
        <ExitGame />
      </div>
      {/* //////// waiting model //////// */}

      {/* <Modal open={isModalOpen} footer={null} closable={false}>
        <Row justify="center">
          <h1 className="Commonquestions">Waiting: {waiting}</h1>
        </Row>
        <Row>
          {type === "join" ? (
            <Status
              lobbyId={LobbyIdAndRound?.lobby?._id}
              round={round}
              answerData={answerData}
            />
          ) : (
            <CommonQuestions
              lobbyId={LobbyIdAndRound?.lobby?._id}
              round={round}
              answerData={answerData}
            />
          )}
        </Row>
      </Modal> */}
    </div>
  );
};

export default RoundThreeScreen;
