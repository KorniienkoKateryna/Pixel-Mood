import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import { FaUser, FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { EmailStatus } from "js/util/SettingsUtils";

export default class AccountSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: this.props.name,
      username: this.props.username,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      updateFormValidated: false,
      changePasswordFormValidated: false,
      usernameTaken: false,
      email: this.props.email,
      emailValid: true,
    };
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.name !== prevProps.name ||
      this.props.username !== prevProps.username ||
      this.props.email !== prevProps.email
    ) {
      this.setState({
        name: this.props.name,
        username: this.props.username,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
        updateFormValidated: false,
        changePasswordFormValidated: false,
        usernameTaken: false,
        email: this.props.email,
        emailValid: true,
      });
    }
  }

  onChangeName = (e) => {
    this.setState({
      name: e.target.value,
    });
  };

  onChangeUsername = async (e) => {
    this.setState({
      username: e.target.value,
    });

    let username = e.target.value;
    if (username !== "" && username !== this.props.username) {
      let usernameAvailable = await this.props.checkUsernameAvailable(username);
      this.setState({
        usernameTaken: !usernameAvailable,
      });
    }
  };

  onChangePassword = (e) => {
    this.setState({
      currentPassword: e.target.value,
    });
  };

  onChangeNewPassword = (e) => {
    this.setState({
      newPassword: e.target.value,
    });
  };

  onChangeConfirmNewPassword = (e) => {
    this.setState({
      confirmNewPassword: e.target.value,
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
    /* eslint-disable */
    const regex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    /* eslint-enable */

    if (email !== "" && !email.match(regex)) return false;

    let available = await this.props.checkEmailAvailable(email);
    return available;
  };

  handleUpdateSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    let form = e.currentTarget;

    if (this.state.usernameTaken) {
      return;
    }

    this.setState({
      updateFormValidated: true,
    });

    if (form.checkValidity() === true) {
      this.props.updateAccountInfo(this.state.name, this.state.username);
    }
  };

  handlePasswordSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    let form = e.currentTarget;

    if (
      this.state.currentPassword === this.state.newPassword ||
      this.state.newPassword !== this.state.confirmNewPassword
    ) {
      return;
    }

    this.setState({
      changePasswordFormValidated: true,
    });

    if (form.checkValidity() === true) {
      this.props.changePassword(
        this.state.currentPassword,
        this.state.newPassword
      );
    }
  };

  deleteAccount = () => {
    if (
      window.confirm(
        "Ви впевнені, що хочете видалити свій обліковий запис? Це незворотна дія!"
      )
    ) {
      this.props.setRedirect("/");
      this.props.deleteAccount();
    }
  };

  render() {
    return (
      <Card className="bg-light">
        <Card.Header>
          <h3 className="text-center">Налаштування облікового запису</h3>
        </Card.Header>
        <Card.Body className="w-100 mx-auto">
          <Container className="w-100 mw-100">
            <Row className="equal">
              <Col lg={6} className={this.props.inLg ? "" : "mb-5"}>
                <Form
                  noValidate
                  validated={this.state.updateFormValidated}
                  onSubmit={this.handleUpdateSubmit}
                  className="w-75 mx-auto d-flex flex-column h-100"
                >
                  <Form.Group>
                    <Form.Label as="h5">Ім'я</Form.Label>
                    <InputGroup>
                      <InputGroup.Prepend>
                        <InputGroup.Text>
                          <FaUser></FaUser>
                        </InputGroup.Text>
                      </InputGroup.Prepend>
                      <FormControl
                        placeholder="Ім'я"
                        type="text"
                        value={this.state.name}
                        onChange={this.onChangeName}
                      />
                    </InputGroup>
                    <small className="form-text text-muted">
                      Ви можете залишити це поле порожнім.
                    </small>
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label as="h5">Ім'я користувача</Form.Label>
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
                        isInvalid={this.state.usernameTaken}
                        value={this.state.username}
                        onChange={this.onChangeUsername}
                      />

                      <FormControl.Feedback type="invalid">
                        Ім'я користувача вже зайняте / порожнє.
                      </FormControl.Feedback>
                    </InputGroup>
                  </Form.Group>

                  <br></br>

                  <Button
                    variant="primary"
                    type="submit"
                    block
                    className="mt-auto"
                  >
                    Оновити налаштування облікового запису
                  </Button>
                </Form>
              </Col>
              <Col lg={6}>
                <Form
                  noValidate
                  validated={this.state.changePasswordFormValidated}
                  onSubmit={this.handlePasswordSubmit}
                  className="w-75 mx-auto d-flex flex-column h-100"
                >
                  <Form.Label as="h5">Змінити пароль</Form.Label>

                  <Form.Group>
                    <InputGroup>
                      <InputGroup.Prepend>
                        <InputGroup.Text>
                          <FaLock></FaLock>
                        </InputGroup.Text>
                      </InputGroup.Prepend>
                      <FormControl
                        placeholder="Current Password"
                        type="password"
                        required
                        value={this.state.password}
                        onChange={this.onChangePassword}
                      />

                      <FormControl.Feedback type="invalid">
                        Будь ласка, введіть поточний пароль
                      </FormControl.Feedback>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <InputGroup>
                      <InputGroup.Prepend>
                        <InputGroup.Text>
                          <FaLock></FaLock>
                        </InputGroup.Text>
                      </InputGroup.Prepend>
                      <FormControl
                        placeholder="New Password"
                        type="password"
                        required
                        isInvalid={
                          this.state.newPassword === this.state.password
                        }
                        value={this.state.newPassword}
                        onChange={this.onChangeNewPassword}
                      />

                      <FormControl.Feedback type="invalid">
                        Новий пароль має відрізнятися від поточного пароля
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
                        placeholder="Confirm New Password"
                        type="password"
                        required
                        isInvalid={
                          this.state.newPassword !==
                          this.state.confirmNewPassword
                        }
                        value={this.state.confirmNewPassword}
                        onChange={this.onChangeConfirmNewPassword}
                      />

                      <FormControl.Feedback type="invalid">
                        Паролі не введені / не збігаються
                      </FormControl.Feedback>
                    </InputGroup>
                  </Form.Group>
                  <br></br>
                  <Button
                    variant="danger"
                    type="submit"
                    block
                    className="mt-auto"
                  >
                    Змінити пароль
                  </Button>
                </Form>
              </Col>
            </Row>
            <Row className="mt-5 mb-3 w-50 mx-auto">
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>
                    <MdEmail></MdEmail>
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                  placeholder="Email Address"
                  type="text"
                  isInvalid={!this.state.emailValid}
                  value={this.state.email}
                  onChange={this.onChangeEmail}
                />
                <FormControl.Feedback type="invalid">
                  Електронна адреса недійсна.
                </FormControl.Feedback>
              </InputGroup>
              <small className="form-text text-muted">
               Це необов'язково, але дуже рекомендується.
              </small>
            </Row>
            <Row className="mt-3">
              {this.props.emailStatus === EmailStatus.NOT_VERIFIED && (
                <Button
                  variant="primary"
                  className="mx-auto"
                  onClick={this.props.resendEmailVerification}
                >
                  Повторно надіслати електронний лист з підтвердженням
                </Button>
              )}
              <Button
                variant="primary"
                type="submit"
                className="mx-auto"
                onClick={() => {
                  this.props.changeEmail(this.state.email);
                }}
              >
                Змінити адресу електронної пошти
              </Button>
            </Row>
            <Row>
              <Button
                variant="danger"
                onClick={this.deleteAccount}
                className="mx-auto mt-5 w-25"
                block
              >
               Видалити обліковий запис
              </Button>
            </Row>
          </Container>
        </Card.Body>
      </Card>
    );
  }
}
