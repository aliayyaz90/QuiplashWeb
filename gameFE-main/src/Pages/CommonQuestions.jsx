import { Col, Row, Checkbox, Button, Skeleton } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../helper/helper";
import ExitGame from "./ExitGame";
import { addVote, getCommonQuestions, status } from "./request";

const CommonQuestions = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const round = urlParams.get("round");
  const id = urlParams.get("id");
  const startRoundId = urlParams.get("startRoundId");
  const userId = urlParams.get("userId");
  const type = urlParams.get("type");
  const code = urlParams.get("code");
  const checkAnswer = urlParams.get("checkAnswer");

  const navigate = useNavigate();
  const [loader, setLoader] = useState("");
  const [voteQuestionId, setVoteQuestionId] = useState("");
  const [commonQuestionsResponse, setCommonQuestionsResponse] = useState("");
  const [waiting, setWaiting] = useState(20);
  const [moveToNextRound, setMoveToNextRound] = useState("");

  const [index, setIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    showCommonQuestions();
  }, []);
  useEffect(() => {
    showCommonQuestions();

    const eventSource = new EventSource(
      `${process.env.REACT_APP_BASE_URL_HOOK}/lobby/connect?lobby=${code}`,
      {
        headers: {
          Authorization: "Bearer hello", // Send the token in the Authorization header
        },
      }
    );
    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      const parseConvert = JSON.parse(newData);
      if (parseConvert.message === "voting change") {

        setIndex(parseConvert?.index);
        setWaiting(20);
        setIsLoading(false);
      } else if (parseConvert.message === "voting end") {
        setMoveToNextRound(parseConvert.message);
      }
    };
    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      eventSource.close();
    };
    return () => {
      eventSource.close();
    };
  }, [index]);
  useEffect(() => {
    if (moveToNextRound === "voting end") {
      if (round === "1") {
        if (type === "join") {
          const storedUserId = JSON.parse(localStorage.getItem("UserId"));
          navigate(
            `/round-two?type=join&&round=2&&code=${code}&&userId=${storedUserId}`
          );
        } else {
          navigate(`/round-two?round=2&&code=${code}&&id=${id}`);
        }
      } else if (round === "2") {
        if (type === "join") {
          const storedUserId = JSON.parse(localStorage.getItem("UserId"));
          navigate(
            `/round-three?type=join&&round=3&&code=${code}&&userId=${storedUserId}`
          );
        } else {
          navigate(`/round-three?round=3&&code=${code}&&id=${id}`);
        }
      } else {
        console.log("complete all rounds");
      }
    } else if (waiting === 0) {
      setIsLoading(true);
    }
  }, [waiting]);

  useEffect(() => {
    const countdown = setInterval(() => {
      if (waiting > 0) {
        setWaiting((prevWaiting) => prevWaiting - 1);
      }
    }, 2000);

    return () => clearInterval(countdown);
  }, [waiting]);
  const showCommonQuestions = () => {
    let payload = {
      lobbyId: startRoundId,
      round: round,
    };
    makeRequest(setLoader, getCommonQuestions, payload, onSuccess, onError);
  };

  const onSuccess = (res) => {
    if (round === "1") {
      if (type === "join")   {
        setCommonQuestionsResponse(res?.response?.rounds[0]?.commonQuestions);
      } else {
        setCommonQuestionsResponse(res?.response?.rounds[0]?.commonQuestions);
      }
    } else if (round === "2") {
      if (type === "join") {
        setCommonQuestionsResponse(res?.response?.rounds[1]?.commonQuestions);
      } else {
        setCommonQuestionsResponse(res?.response?.rounds[1]?.commonQuestions);
      }
    } else if (round === "3") {
      if (type === "join") {
        setCommonQuestionsResponse(res?.response?.rounds[2]?.commonQuestions);
      } else {
        setCommonQuestionsResponse(res?.response?.rounds[2]?.commonQuestions);
      }
    }
  };
  const onChange = (questionId) => {
    setVoteQuestionId(questionId);
  };
  const onError = () => {};
  const handleVoting = () => {
    setIsLoading(true);

    // if (index === 0) {
    //   setIsLoading(true);
    // } else {
    //   if (round === "1") {
    //     if (type === "join") {
    //       const storedUserId = JSON.parse(localStorage.getItem("UserId"));
    //       navigate(
    //         `/round-two?type=join&&round=2&&code=${code}&&userId=${storedUserId}`
    //       );
    //     } else {
    //       navigate(`/round-two?round=2&&code=${code}&&id=${id}`);
    //     }
    //   } else if (round === "2") {
    //     if (type === "join") {
    //       const storedUserId = JSON.parse(localStorage.getItem("UserId"));
    //       navigate(
    //         `/round-three?type=join&&round=3&&code=${code}&&userId=${storedUserId}`
    //       );
    //     } else {
    //       navigate(`/round-three?round=3&&code=${code}&&id=${id}`);
    //     }
    //   } else {
    //     console.log("complete all rounds");
    //   }
    // }

    let payload = {
      lobbyUserId: type === "join" ? userId : id,
      round: round,
      lobbyId: startRoundId,
      questionId: voteQuestionId,
    };
    makeRequest(setLoader, addVote, payload, onSuccessVote, onErrorVote);
  };

  const onSuccessVote = (res) => {};
  const onErrorVote = () => {};

  return (
    <>
      <div className="center">
        <div className="form-box-common">
          
          {" "}
          {isLoading || index === null ? (
            checkAnswer === "true" ? (
              <>
                {" "}
                {isLoading ? (
                  <Skeleton active />
                ) : (
                  <>
                    <Row justify="center">
                      <h1 className="Commonquestions">Waiting: {waiting} </h1>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <p className="Commonquestions"> Round {round}</p>
                        <p className="Commonquestions">
                          Q:{" "}
                          {commonQuestionsResponse &&
                            commonQuestionsResponse[0]?.question}
                        </p>
                        {commonQuestionsResponse &&
                          commonQuestionsResponse[0]?.answerBy.map((obj) => (
                            <p className="Commonquestions" key={obj?._id}>
                              <Checkbox
                                onChange={() => onChange(obj?._id)}
                              ></Checkbox>
                              Answer:
                              {obj.answer}
                            </p>
                          ))}
                      </Col>
                    </Row>
                    <Row justify="end">
                      <Button
                        onClick={handleVoting}
                        className="create-btn-2"
                        loading={loader}
                        disabled={
                          commonQuestionsResponse &&
                          commonQuestionsResponse[0]?.answerBy.find((item) =>
                            item.lobbyUserId?.toString() == id?.toString() || item.lobbyUserId?.toString() == userId?.toString()
                              ? true
                              : false
                          )
                        }
                      >
                        Vote
                      </Button>
                    </Row>{" "}
                  </>
                )}
              </>
            ) : (
              <Skeleton active />
            )
          ) : (
            <>
              <Row justify="center">
                <h1 className="Commonquestions">Waiting: {waiting} </h1>
              </Row>
              <Row>
                <Col span={24}>
                  <p className="Commonquestions"> Round {round}</p>
                  <p className="Commonquestions">
                    Q:{" "}
                    {commonQuestionsResponse &&
                      commonQuestionsResponse[index]?.question}
                  </p>
                  {commonQuestionsResponse &&
                    commonQuestionsResponse[index]?.answerBy.map((obj) => (
                      <p className="Commonquestions">
                        <Checkbox
                          onChange={() => onChange(obj?._id)}
                        ></Checkbox>{" "}
                        Answer:
                        {obj.answer}
                      </p>
                    ))}
                </Col>
              </Row>

              <Row justify="end">
                <Button
                  onClick={handleVoting}
                  className="create-btn-2"
                  loading={loader}
                  disabled={
                    commonQuestionsResponse &&
                    commonQuestionsResponse[index]?.answerBy.find((item) =>
                      item.lobbyUserId?.toString() == id?.toString() || item.lobbyUserId?.toString() == userId?.toString()
                        ? true
                        : false
                    )
                  }
                >
                  Vote
                </Button>
              </Row>
            </>
          )}
        </div>
      </div>
      <ExitGame />
    </>
  );
};

export default CommonQuestions;
