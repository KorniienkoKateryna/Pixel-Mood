import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

export default class ExportData extends Component {
  render() {
    return (
      <Card className="bg-light">
        <Card.Header>
          <h3 className="text-center">Керування даними</h3>
        </Card.Header>
        <Card.Body className="w-100 mx-auto">
          <Container className="w-100 mw-100 mt-3">
            <Row>
              <Col lg={6} className={this.props.inLg ? "" : "mb-3"}>
                <div className="w-75 mx-auto">
                  <Button
                    className="mx-auto"
                    block
                    onClick={this.props.exportUserData}
                  >
                    Експортувати всі дані користувача
                  </Button>
                </div>
              </Col>
              <Col lg={6} className={this.props.inLg ? "" : "mb-3"}>
                <div className="w-75 mx-auto">
                  <Button className="mx-auto" block>
                    Імпорт даних користувача (незавершений)
                  </Button>
                </div>
              </Col>
            </Row>
          </Container>
        </Card.Body>
      </Card>
    );
  }
}
