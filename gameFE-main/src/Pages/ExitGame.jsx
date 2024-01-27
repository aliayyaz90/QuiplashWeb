import React, { useEffect, useState } from "react";
import { Button, Col, Modal, Row } from "antd";
import { EnterOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
const ExitGame = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  window.onload = () => {
    showModal();
  };
  const handleExit = () => {
    localStorage.removeItem("lobbyCode");
    localStorage.removeItem("checkAnswer")
    setIsModalOpen(false);

    navigate("/");
  };

  return (
    <>
      {/* <Button type="primary" onClick={showModal}>
        Open Modal
      </Button> */}
      <Row>
        <Col span={24}>
          <Modal
            // title="Basic Modal"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={null}
            closable={false}
          >
            <Row>
              <Col span={24}>
                <div className="modal-div">
                  <Row justify="center">
                    <div>
                      <p className="modal-text">Pause</p>
                    </div>
                  </Row>
                  <Row justify="center">
                    <div>
                      <p className="modal-text-inner">
                        DO YOU WANT TO EXIT THE GAME?
                      </p>
                    </div>
                  </Row>
                  <Row justify="center">
                    <Col>
                      <p className="text-inner">
                        All current progress will be lost.{" "}
                      </p>
                    </Col>
                  </Row>

                  <Row justify="space-evenly">
                    <Col>
                      <p className="btn-text-modal">EXIT</p>
                      <Button className="alert-btn-arrow" onClick={handleExit}>
                        <EnterOutlined />
                      </Button>
                    </Col>
                    <Col>
                      <p className="btn-text-modal">RESUME</p>
                      <Button className="alert-btn" onClick={handleCancel}>
                        esc
                      </Button>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </Modal>
        </Col>
      </Row>
    </>
  );
};
export default ExitGame;
