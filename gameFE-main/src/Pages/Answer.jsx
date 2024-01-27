import { Alert, Button, Col, Form, Input, Modal, Row, Skeleton } from "antd";
import React, { useEffect, useState } from "react";
import { getAsnwer, getStatus, submitAnswer } from "./request";
import { makeRequest } from "../helper/helper";
import ExitGame from "./ExitGame";
import RoundTwoScreen from "./RoundTwoScreen";
import { useNavigate } from "react-router-dom";
import CommonQuestions from "./CommonQuestions";
import Status from "./Status";
const Answer = () => {
  const navigate = useNavigate();
  const [move, setMove] = useState(false);
  const [skeletonLoading, setSkeletonLoading] = useState(false);
  const [newSkeletonLoading, setNewSkeletonLoading] = useState(false);
  const [loader, setLoader] = useState("");
  const [answer, setAnswer] = useState([]);
  const [answerData, setanswerData] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [remainingTime, setRemainingTime] = useState(45);
  const urlParams = new URLSearchParams(window.location.search);
  const round = urlParams.get("round");
  const code = urlParams.get("code");
  const id = urlParams.get("id");
  const type = urlParams.get("type");
  const userId = urlParams.get("userId");
  const creatorId = urlParams.get("creatorId");
  const [commonQuestionShow, setCommonQuestionShow] = useState(false);

  const saveAnswerToLocalStorage = (data) => {
    localStorage.setItem("answerData", JSON.stringify(data));
  };

  const getAnswerFromLocalStorage = () => {
    const storedData = localStorage.getItem("answerData");
    return storedData ? JSON.parse(storedData) : null;
  };

  useEffect(() => {
    if (creatorId) {
      const eventSource = new EventSource(
        `${process.env.REACT_APP_BASE_URL_HOOK}/lobby/connect?lobby=${creatorId}`,
        {
          headers: {
            Authorization: "Bearer hello", // Send the token in the Authorization header
          },
        }
      );
      eventSource.onmessage = (event) => {
        const newData = JSON.parse(event.data);
        const parseConvert = JSON.parse(newData);
        if (parseConvert.message === "join the game") {
          setShowForm(false);
          joinQuestionAnswer();
        }
      };
      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        eventSource.close();
      };
      return () => {
        eventSource.close();
      };
    }
  }, []);

  useEffect(() => {
    if (id) {
      QuestionAnswer();
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
      // setSkeletonLoading(false);
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

  // useEffect(() => {
  //   if (waiting === 0) {
  //     setIsModalOpen(false);
  //     // const storedUserId = JSON.parse(localStorage.getItem("UserId"));
  //     // if (type === "join") {
  //     //   navigate(
  //     //     `round-two?type=join&&round=2&&code=${LobbyIdAndRound?.lobby?.lobbyCode}&&userId=${storedUserId}`
  //     //   );
  //     // } else {
  //     //   navigate(
  //     //     `round-two?round=2&&code=${LobbyIdAndRound?.lobby?.lobbyCode}&&id=${LobbyIdAndRound?.lobby?.lobbyCreator?._id}`
  //     //   );
  //     // }
  //     // navigate(
  //     //   `round-two?round=2&&code=${LobbyIdAndRound?.lobby?.lobbyCode}&&id=${LobbyIdAndRound?.lobby?.lobbyCreator?._id}`
  //     // );
  //   }
  // }, [waiting, LobbyIdAndRound]);
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
    localStorage.setItem("startRoundId", JSON.stringify(res._id));
    const loop1Questions =
      res?.rounds[0]?.loop1.filter((item) => item.lobbyUserId === id) || [];
    const loop2Questions =
      res?.rounds[0]?.loop2.filter((item) => item.lobbyUserId === id) || [];

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
    localStorage.setItem("startRoundId", JSON.stringify(res._id));

    const loop1Questions =
      res?.rounds[0]?.loop1.filter((item) => item.lobbyUserId === userId) || [];
    const loop2Questions =
      res?.rounds[0]?.loop2.filter((item) => item.lobbyUserId === userId) || [];

    setAnswer([...loop1Questions, ...loop2Questions]);
    setanswerData(res);
    saveAnswerToLocalStorage({
      answer: [...loop1Questions, ...loop2Questions],
      answerData: res,
    });
  };
  const onErrorJoinAswer = () => {};

  const onFinish = (payload) => {
    if (showAnswer === false) {
      let load = {
        ...payload,
        lobbyId: answerData?._id,
        userId:
          type === "join"
            ? userId
            : answerData?.rounds[0]?.loop1[0]?.lobbyUserId,
        round: answerData?.rounds[0]?.round,
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
        userId:
          type === "join"
            ? userId
            : answerData?.rounds[0]?.loop1[0]?.lobbyUserId,
        round: answerData?.rounds[0]?.round,
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
    setRemainingTime(45)
    // setSkeletonLoading(true);
    setShowAnswer(true);
  };
  const onSuccessAnswerTwo = (res) => {
    setRemainingTime(45)

    setMove(res?.lobby?.isAnswersCompleted);

    // setCommonQuestionShow(true);
    // setNewSkeletonLoading(true);

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
    <>
      <div className="center">
        <Row>
          <div className="form-box">
            {showForm && userId ? (
              <Skeleton active />
            ) : (
              <>
                <Row justify="center">
                  <h1 className="questions">
                    Round 1 - {remainingTime} seconds
                  </h1>
                </Row>
                {!showAnswer ? (
                  <>
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
                  // ) : skeletonLoading ? (
                  //   <Skeleton active />
                  // ) : newSkeletonLoading ? (
                  //   <Skeleton active />
                  // )
                  <>
                    <div className="center">
                      <div className="form-box">
                        {" "}
                        <Row justify="center">
                          <h1 className="questions">
                            Round 1 - {remainingTime} seconds
                          </h1>
                        </Row>
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
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </Row>
        <ExitGame />
      </div>
      {/* <div className="center">
          <div className="form-box">
            <Row justify="center">
              <h1 className="Commonquestions">Waiting: {waiting} </h1>
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
          </div>
        </div> */}
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
              waiting={waiting}
            />
          )}
        </Row>
      </Modal> */}
    </>
  );
};

export default Answer;
