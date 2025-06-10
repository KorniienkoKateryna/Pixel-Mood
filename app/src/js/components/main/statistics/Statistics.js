import { Component } from "react";
import Card from "react-bootstrap/Card";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import CountStatistics from "./count/CountStatistics";
import SummaryMonth from "./SummaryMonth";
import SummaryColor from "./SummaryColor";

export default class Statistics extends Component {
  render() {
    return (
      <Card className={this.props.className}>
        <Card.Header>
          <h3 className="text-center">Статистика</h3>
        </Card.Header>
        <Card.Body>
          <Tabs defaultActiveKey="count" id="statistics-tabs" className="mb-3">
            <Tab eventKey="count" title="Кількість">
              <CountStatistics 
                values={this.props.values}
                colorSchemes={this.props.colorSchemes}
                year={this.props.year}
              />
            </Tab>
            <Tab eventKey="summary-month" title="Підсумок місяця">
              <SummaryMonth
                values={this.props.values}
                colorSchemes={this.props.colorSchemes}
                year={this.props.year}
              />
            </Tab>
            <Tab eventKey="summary-color" title="Огляд кольорів">
              <SummaryColor
                values={this.props.values}
                colorSchemes={this.props.colorSchemes}
                year={this.props.year}
              />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    );
  }
}
