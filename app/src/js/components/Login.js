import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import { FaUser, FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";

import withRedirect from "js/util/react/WithRedirect";

import "css/Form.css";

class CreateUser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      validated: false,
    };
  }

  onChangeUsername = (e) => {
    this.setState({
      username: e.target.value,
    });
  };

  onChangePassword = (e) => {
    this.setState({
      password: e.target.value,
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    let form = e.currentTarget;

    this.setState({
      validated: true,
    });

    if (form.checkValidity() === true) {
      let success = await this.props.login(
        this.state.username,
        this.state.password
      );
      if (success) this.props.setRedirect("/");
    }
  };

  render() {
    return (
      <Container className="mt-3 form">
        <Card className="bg-light">
          <Card.Header>
            <h3 className="text-center">Вхід до акаунта</h3>
          </Card.Header>
          <Card.Body className="form-body mx-auto">
            <Form
              noValidate
              validated={this.state.validated}
              onSubmit={this.handleSubmit}
            >
              <Form.Group>
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text>
                      <FaUser></FaUser>
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl
                    placeholder="Ім'я користувача"
                    type="text"
                    required
                    value={this.state.username}
                    onChange={this.onChangeUsername}
                  />

                  <FormControl.Feedback type="invalid">
                    Введіть ім’я користувача.
                  </FormControl.Feedback>
                </InputGroup>
              </Form.Group>

              <Form.Group>
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text>
                      <FaLock></FaLock>
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl
                    placeholder="Пароль"
                    type="password"
                    required
                    value={this.state.password}
                    onChange={this.onChangePassword}
                  />

                  <FormControl.Feedback type="invalid">
                    Введіть пароль.
                  </FormControl.Feedback>
                </InputGroup>
              </Form.Group>
              <br></br>
              <Button variant="primary" type="submit" block>
                Увійти
              </Button>
            </Form>

            <p className="mt-3 text-center">
              Ще не маєте акаунта?{" "}
              <Link to="/register">Зареєструватися</Link>
            </p>
            <p className="mt-3 text-center">
              Забули пароль?{" "}
              <Link to="/request-reset">Відновити доступ</Link>
            </p>
          </Card.Body>
        </Card>
      </Container>
    );
  }
}

export default withRedirect(CreateUser);
