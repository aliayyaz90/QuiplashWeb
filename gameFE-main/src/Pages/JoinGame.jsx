import { Button, Col, Form, Input, message, Popconfirm, Row } from "antd";
import React, { useEffect, useState } from "react";
import { makeRequest } from "../helper/helper";
import { createUser, joinTheGame, playGame } from "./request";
import { CopyOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const JoinGame = () => {
  const [isPlay, setIsPlay] = useState(true);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loader, setLoader] = useState("");
  const [joinGame, setJoinGame] = useState(() => {
    const storedJoinGame = localStorage.getItem("joinGame");
    return storedJoinGame ? JSON.parse(storedJoinGame) : false;
  });
  const [lobbyCode, setLobbyCode] = useState("");
  const [createGame, setCreateGame] = useState("");

  useEffect(() => {
    const storedLobbyCode = localStorage.getItem("lobbyCode");
    if (storedLobbyCode) {
      setLobbyCode(storedLobbyCode);
    }
  }, []);

  const onFinish = (payload) => {
    // if (!joinGame) {
    //   if (payload.name) {
    //     let load = {
    //       ...payload,
    //     };

    //     makeRequest(setLoader, createUser, load, onSuccess, onError);
    //   } else {
    //     form.setFields([
    //       {
    //         name: "name",
    //         errors: ["Please enter user name!"],
    //       },
    //     ]);
    //   }
    // } else {
    //   if (payload.lobbyCode && payload.playerName) {
    //     let load = {
    //       ...payload,
    //     };

    //     makeRequest(setLoader, joinTheGame, load, onSuccessJoin, onErrorJoin);
    //   } else {
    //     form.setFields([
    //       {
    //         name: "lobbyCode",
    //         errors: ["Please enter lobby code!"],
    //       },
    //       {
    //         name: "playerName",
    //         errors: ["Please enter player name!"],
    //       },
    //     ]);
    //   }
    // }
    if (payload.lobbyCode && payload.playerName) {
      let load = {
        ...payload,
      };

      makeRequest(setLoader, joinTheGame, load, onSuccessJoin, onErrorJoin);
    } else {
      form.setFields([
        {
          name: "lobbyCode",
          errors: ["Please enter lobby code!"],
        },
        {
          name: "playerName",
          errors: ["Please enter player name!"],
        },
      ]);
    }
  };

  const onSuccess = (res) => {
    // setLobbyCode(res.lobbyCode);
    // setCreateGame(res);
 
  };

  const onError = (err) => {};
  const onSuccessJoin = (res) => {
    if (res?.lobbyCreator?._id == res?.userId) {
      setLobbyCode(res.lobbyCode);
      setCreateGame(res);
    } else {
      localStorage.setItem("UserId", JSON.stringify(res.userId));
      navigate(
        `answer?type=join&&round=1&&code=${res?.lobbyCode}&&userId=${res?.userId}&&creatorId=${res?.lobbyCreator?._id} `
      );
    }

    // Replace 'chand' with the desired username
    const lobby = `${res.lobbyCode}`;
    const eventSource = new EventSource(
      `${process.env.REACT_APP_BASE_URL_HOOK}/lobby/connect?lobby=${lobby}`,
      {
        headers: {
          Authorization: "Bearer hello", // Send the token in the Authorization header
        },
      }
    );
    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      const parseConvert = JSON.parse(newData);
      if (parseConvert.message === "you can start the game") {
        setIsPlay(false);
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

  const onErrorJoin = () => {};

  const handleCopyClick = () => {
    const textArea = document.createElement("textarea");
    textArea.value = lobbyCode;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    message.success("Copied Lobby Code");
  };

  const confirm = (e) => {
    console.log(e);
    message.success("Click on Yes");
    setLobbyCode("");
    localStorage.removeItem("lobbyCode");
  };

  const cancel = (e) => {
    console.log(e);
    message.error("Click on No");
  };

  useEffect(() => {
    localStorage.setItem("joinGame", JSON.stringify(joinGame));
  }, [joinGame]);
  const handlePlay = () => {
    let payload = {
      id: createGame?.lobbyCreator?._id,
      lobbyCode: createGame?.lobbyCode,
    };
    makeRequest(setLoader, playGame, payload, onSuccessPlay, onErrorPlay);
  };
  const onSuccessPlay = (res) => {
    navigate(
      `answer?round=1&&code=${res?.lobbyCode}&&id=${res?.lobbyCreatorId}`
    );
  };
  const onErrorPlay = () => {};
  return (
    <>
      <div className="center">
        {/* {!lobbyCode ? (
          <Row justify="space-between">
            <Col span={10}>
              <Button
                className="game-btn game-btn-2"
                onClick={() => setJoinGame(true)}
              >
                Join The Game
              </Button>
            </Col>
            <Col span={10}>
              <Button className="game-btn" onClick={() => setJoinGame(false)}>
                Create Game
              </Button>
            </Col>
          </Row>
        ) : (
          ""
        )} */}
        <Row>
          <div className="form-box">
            {lobbyCode ? (
              <>
                <h1 className="code">Lobby Code</h1>
                <div className="input-field">
                  <Row justify="center">
                    <h1 className="code-text">{lobbyCode}</h1>
                    <CopyOutlined className="icon" onClick={handleCopyClick} />
                  </Row>
                </div>
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <Row justify="end">
                  <Popconfirm
                    title="Quit"
                    description="Are you sure you want to quit the game?"
                    onConfirm={confirm}
                    onCancel={cancel}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button htmlType="submit" className="create-btn-2">
                      Back
                    </Button>
                  </Popconfirm>
                  &nbsp; &nbsp; &nbsp;
                  <Button
                    htmlType="submit"
                    className="create-btn-2"
                    onClick={handlePlay}
                    loading={loader}
                    disabled={isPlay}
                  >
                    Play
                  </Button>
                </Row>
              </>
            ) : (
              <Form layout="vertical" onFinish={onFinish} form={form}>
                {/* {!joinGame ? (
                  <>
                    <Form.Item
                      label="User Name"
                      name="name"
                      className="custom-label"
                    >
                      <Input className="input-field" />
                    </Form.Item>
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                  </>
                ) : ( */}
                <>
                  <Form.Item
                    label="Game Code"
                    name="lobbyCode"
                    className="custom-label"
                  >
                    <Input className="input-field" />
                  </Form.Item>
                  <Form.Item
                    label="User Name"
                    name="playerName"
                    className="custom-label"
                  >
                    <Input className="input-field" />
                  </Form.Item>
                </>
                {/* )} */}
                <Row justify="end">
                  <Form.Item>
                    {/* {!joinGame ? (
                      <Button
                        htmlType="submit"
                        className="create-btn"
                        loading={loader}
                      >
                        Create
                      </Button>
                    ) : ( */}
                    <Button
                      htmlType="submit"
                      className="create-btn-2"
                      loading={loader}
                    >
                      Join
                    </Button>
                    {/* )} */}
                  </Form.Item>
                </Row>
              </Form>
            )}
          </div>
        </Row>
      </div>
    </>
  );
};

export default JoinGame;
