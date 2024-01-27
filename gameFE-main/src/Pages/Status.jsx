import { Col, Row, Checkbox, Button, Skeleton } from "antd";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { makeRequest } from "../helper/helper";
import ExitGame from "./ExitGame";
import { addVote, status } from "./request";

const Status = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const round = urlParams.get("round");
  const userId = urlParams.get("userId");
  const startRoundId = urlParams.get("startRoundId");
  const [loader, setLoader] = useState("");
  const [voteQuestionId, setVoteQuestionId] = useState("");
  const [commonQuestionsResponse, setCommonQuestionsResponse] = useState();
  const [waiting, setWaiting] = useState(20);
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    showCommonQuestions();
  }, []);


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
      userId: userId,
      status: true,
    };

    makeRequest(setLoader, status, payload, onSuccess, onError);
  };

  const onSuccess = (res) => {
    setCommonQuestionsResponse(res?.rounds[0]?.commonQuestions);
  };
  const onChange = (questionId) => {
    setVoteQuestionId(questionId);
  };
  const onError = () => {};
  const handleVoting = () => {
    if (index === 0) {
      setIsLoading(true);
    }

    let payload = {
      lobbyUserId: userId,
      round: round,
      lobbyId: startRoundId,
      questionId: voteQuestionId,
    };
    makeRequest(setLoader, addVote, payload, onSuccessVote, onErrorVote);
  };

  const onSuccessVote = (res) => {
    const eventSource = new EventSource(
      `${process.env.REACT_APP_API_BASE_URL}/lobby/connect?lobby=${res?.lobbyCode}`,
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
      }
    };
    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      eventSource.close();
    };
    return () => {
      eventSource.close();
    };
  };
  const onErrorVote = () => {};

  return (
    <>
      <div className="center">
        <div className="form-box">
          <Row justify="center">
            <h1 className="Commonquestions">Waiting: {waiting} </h1>
          </Row>
          <Row>
            {isLoading ? (
              <Skeleton active />
            ) : (
              <>
                <Col span={24}>
                  <p className="Commonquestions"> Round {round}</p>
                  <p className="Commonquestions">
                    Q:{" "}
                    {commonQuestionsResponse &&
                      commonQuestionsResponse[index]?.question}
                  </p>
                  {commonQuestionsResponse &&
                    commonQuestionsResponse[index]?.answerBy.map((obj) => (
                      <p className="Commonquestions" key={obj?._id}>
                        <Checkbox
                          onChange={() => onChange(obj?._id)}
                        ></Checkbox>{" "}
                        Answer:
                        {obj.answer}
                      </p>
                    ))}
                </Col>

                <Row justify="end">
                  <Button
                    onClick={handleVoting}
                    className="create-btn-2"
                    loading={loader}
                  >
                    Vote
                  </Button>
                </Row>
              </>
            )}
          </Row>
        </div>
      </div>
      <ExitGame />
    </>
  );
};

export default Status;
