import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import { FaUser, FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { Link } from "react-router-dom";

import withRedirect from "js/util/react/WithRedirect";

import "css/Form.css";

class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      validated: false,
      usernameInvalid: false,
      emailValid: true,
    };
  }

  onChangeName = (e) => {
    this.setState({
      name: e.target.value,
    });
  };

  onChangeEmail = async (e) => {
    let email = e.target.value;

    this.setState({
      email: email,
    });

    let valid = await this.validateEmail(email);

    this.setState({
      emailValid: valid,
    });
  };

  validateEmail = async (email) => {
    const regex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (email !== "" && !email.match(regex)) return false;

    let available = await this.props.checkEmailAvailable(email);
    return available;
  };

  onChangeUsername = async (e) => {
    this.setState({
      username: e.target.value,
    });

    let username = e.target.value;
    if (username !== "") {
      let usernameAvailable = true;

      if (username.length <= 20) {
        usernameAvailable = await this.props.checkUsernameAvailable(username);
      }

      this.setState({
        usernameInvalid: !usernameAvailable || username.length > 20,
      });
    }
  };

  onChangePassword = (e) => {
    this.setState({
      password: e.target.value,
    });
  };

  onChangeConfirmPassword = (e) => {
    this.setState({
      confirmPassword: e.target.value,
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    let form = e.currentTarget;

    if (
      this.state.password !== this.state.confirmPassword ||
      this.state.usernameInvalid ||
      !this.state.emailValid
    ) {
      return;
    }

    this.setState({
      validated: true,
    });

    if (form.checkValidity() === true) {
      let success = await this.props.register(
        this.state.name,
        this.state.username,
        this.state.password,
        this.state.email
      );
      if (success) this.props.setRedirect("/");
    }
  };

  render() {
    return (
      <Container className="mt-3 form">
        <Card className="bg-light">
          <Card.Header>
            <h3 className="text-center">Реєстрація нового акаунту</h3>
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
                    placeholder="Ім’я"
                    type="text"
                    value={this.state.name}
                    onChange={this.onChangeName}
                  />
                </InputGroup>
                <small className="form-text text-muted">
                  Можна залишити порожнім.
                </small>
              </Form.Group>

              <Form.Group>
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text>
                      <MdEmail></MdEmail>
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl
                    placeholder="Email адреса"
                    type="text"
                    isInvalid={!this.state.emailValid}
                    value={this.state.email}
                    onChange={this.onChangeEmail}
                  />
                  <FormControl.Feedback type="invalid">
                    Невірна email адреса.
                  </FormControl.Feedback>
                </InputGroup>
                <small className="form-text text-muted">
                  Необов’язково, але дуже рекомендовано.
                </small>
              </Form.Group>

              <Form.Group>
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text>
                      <FaUser></FaUser>
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl
                    placeholder="Ім’я користувача"
                    type="text"
                    required
                    isInvalid={this.state.usernameInvalid}
                    value={this.state.username}
                    onChange={this.onChangeUsername}
                  />

                  <FormControl.Feedback type="invalid">
                    Ім’я вже зайняте / порожнє / довше за 20 символів.
                  </FormControl.Feedback>
                </InputGroup>
              </Form.Group>

              <br></br>

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
              <Form.Group>
                <InputGroup>
                  <InputGroup.Prepend>
                    <InputGroup.Text>
                      <FaLock></FaLock>
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl
                    placeholder="Підтвердження паролю"
                    type="password"
                    required
                    isInvalid={
                      this.state.password !== this.state.confirmPassword
                    }
                    value={this.state.confirmPassword}
                    onChange={this.onChangeConfirmPassword}
                  />

                  <FormControl.Feedback type="invalid">
                    Паролі не збігаються або не заповнені.
                  </FormControl.Feedback>
                </InputGroup>
              </Form.Group>
              <br></br>
              <Button variant="primary" type="submit" block>
                Зареєструватися
              </Button>
            </Form>

            <p className="mt-3 text-center">
              Вже є акаунт? <Link to="/login">Увійти</Link>
            </p>
          </Card.Body>
        </Card>
      </Container>
    );
  }
}

export default withRedirect(Register);
