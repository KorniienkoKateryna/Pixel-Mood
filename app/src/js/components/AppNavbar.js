import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { NavLink } from "react-router-dom";
import Button from "react-bootstrap/Button";


import withRedirect from "js/util/react/WithRedirect";

import "css/Navbar.css";

class AppNavbar extends React.Component {
  render() {
    let activeStyle = {
      color: "rgba(255,255,255)",
    };

    let title = (
      <NavLink
        to="/"
        exact
        className="navbar-link mr-auto"
        id="navbar-brand"
        eventKey="1"
        key="yip"
      >
        Pixel Mood      </NavLink>
    );

    let primaryContent = (
      <Navbar.Collapse id="basic-navbar-nav" key="collapse">
        <Nav className="">
          <NavLink
            to="/"
            className="navbar-link"
            activeStyle={activeStyle}
            exact
            eventKey="2"
            key="home"
          >
            Головна
          </NavLink>
        </Nav>
        <Nav>
          <NavLink
            to="/about"
            className="navbar-link"
            activeStyle={activeStyle}
            exact
            eventKey="3"
            key="about"
          >
            Про Проєкт
          </NavLink>
        </Nav>
        
      </Navbar.Collapse>
    );

    let loginArea = [];
    if (this.props.loggedIn) {
      loginArea.push(
        <Button
          className="navbar-button text-truncate"
          key="account"
          onClick={() => {
            this.props.setRedirect("/settings");
          }}
          style={{
            maxWidth: this.props.inSm ? "80px" : "200px",
          }}
        >
          {this.props.username}
        </Button>
      );
      loginArea.push(
        <Button
          className="navbar-button"
          key="logout"
          onClick={() => {
            this.props.logout();
          }}
        >
          Вийти
        </Button>
      );
    } else {
      loginArea.push(
        <Button
          className="navbar-button"
          key="login"
          onClick={() => {
            this.props.setRedirect("/login");
          }}
        >
          Увійти
        </Button>
      );
      loginArea.push(
        <Button
          className="navbar-button"
          key="register"
          onClick={() => {
            this.props.setRedirect("/register");
          }}
        >
          Реєстрація
        </Button>
      );
    }

    let navbar = [];

    if (this.props.inLg) {
      navbar.push(title);
      navbar.push(primaryContent);
      navbar.push(
        <Nav className="ml-auto" key="login-area">
          {loginArea}
        </Nav>
      );
    } else {
      navbar.push(
        <Navbar.Toggle
          className="mr-2"
          aria-controls="basic-navbar-nav"
          key="toggle"
        />
      );
      navbar.push(title);
      navbar.push(primaryContent);
      navbar.push(
        <Nav
          className="ml-auto"
          key="login-area"
          style={{ flexDirection: "row" }}
        >
          {loginArea}
        </Nav>
      );
    }

    return (
      <Navbar collapseOnSelect id="navbar" expand="lg" bg="dark" variant="dark">
        {navbar}
      </Navbar>
    );
  }
}

export default withRedirect(AppNavbar);
