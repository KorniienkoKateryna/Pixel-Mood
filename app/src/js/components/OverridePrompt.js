import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export let OverrideOption = Object.freeze({
  REPLACE_CURRENT: "REPLACE_CURRENT",
  REPLACE_ONLINE: "REPLACE_ONLINE",

  MERGE_CURRENT: "MERGE_CURRENT",
  MERGE_ONLINE: "MERGE_ONLINE",
});

export let PromptStatus = Object.freeze({
  DATA: "DATA",
  NONE: "NONE",
});

export class OverridePrompt extends React.Component {
  render() {
    return (
      <Modal
        show={this.props.status !== PromptStatus.NONE}
        backdrop="static"
        size="md"
      >
        <Modal.Header>
          <Modal.Title className="w-100 text-center">Замінити дані</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card>
            <Card.Header as="h5" className="text-center">
              Замінити дані
            </Card.Header>
            <Card.Body>
              <Container>
                <Row>
                  <Col>
                    <Button
                      className="mx-auto d-block"
                      onClick={() => {
                        this.props.handleDataOverride(
                          OverrideOption.REPLACE_CURRENT
                        );
                      }}
                    >
                      Використати локальні дані
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      className="mx-auto d-block"
                      onClick={() => {
                        this.props.handleDataOverride(
                          OverrideOption.REPLACE_ONLINE
                        );
                      }}
                    >
                      Використати онлайн-дані
                    </Button>
                  </Col>
                </Row>
              </Container>
            </Card.Body>
          </Card>
          <hr></hr>
          <Card>
            <Card.Header as="h5" className="text-center">
              Об'єднати дані
            </Card.Header>
            <Card.Body>
              <Container>
                <Row>
                  <Col>
                    <Button
                      className="mx-auto d-block"
                      onClick={() => {
                        this.props.handleDataOverride(
                          OverrideOption.MERGE_CURRENT
                        );
                      }}
                    >
                      Пріоритет — локальні дані
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      className="mx-auto d-block"
                      onClick={() => {
                        this.props.handleDataOverride(
                          OverrideOption.MERGE_ONLINE
                        );
                      }}
                    >
                      Пріоритет — онлайн-дані
                    </Button>
                  </Col>
                </Row>
              </Container>
            </Card.Body>
          </Card>
        </Modal.Body>
      </Modal>
    );
  }
}
