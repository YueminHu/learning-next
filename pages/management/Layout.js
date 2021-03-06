import React, { Component } from "react";
import PropTypes from "prop-types";

import Link from "next/link";

import Modal from "../../components/general/Modal";
export default class Layout extends Component {
  static propTypes = {
    url: PropTypes.object.isRequired,
    clientInfo: PropTypes.object.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      showLoginModal: false
    };
  }
  login = e => {
    this.setState(({ showLoginModal }) => ({
      showLoginModal: !showLoginModal
    }));
  };
  render() {
    const { clientInfo } = this.props;
    const { showLoginModal } = this.state;
    const pathname = this.props.url
      ? this.props.url.pathname.replace("/management", "")
      : "";
    return [
      <div className="header" key="header">
        <h2>welcome to mgr page!</h2>
        <p>
          {clientInfo.auth === "visitor" && (
            <button onClick={this.login}>登录</button>
          )}
        </p>
        <style jsx>{`
          div.header {
            overflow: hidden;
            display: flex;
            justify-content: space-between;
            background-color: beige;
          }
        `}</style>
      </div>,
      <div className="wrapper" key="wrapper">
        <div className="side">
          <Link href="/management">
            <p className={`${pathname === "" && "selected"}`}>index</p>
          </Link>
          <Link href="/management/write">
            <p className={`${pathname === "/write" && "selected"}`}>
              new article
            </p>
          </Link>
          <Link href="/management/stat">
            <p className={`${pathname === "/stat" && "selected"}`}>stat</p>
          </Link>
        </div>
        <div className="content">{this.props.children}</div>
        <style jsx>
          {`
            div.wrapper {
              width: 100vw;
              display: flex;
              flex-direction: row;
            }
            div.side {
              width: 10em;
              height: 100%;
              border-right: 1px solid #666;
              color: #999b93;
              background-color: #191919;
              > p {
                padding: 10px;
                margin: 0;
                background-color: inherit;
                border-bottom: 1px solid #444;
                cursor: pointer;
                font-family: sans-serif;
                &:hover,
                &.selected {
                  background-color: black;
                }
              }
            }
            div.content {
              flex-grow: 1;
              display: flex;
              flex-direction: column;
            }
          `}
        </style>
      </div>,
      <Modal
        key="Modal"
        show={showLoginModal}
        onClose={e =>
          this.setState({
            showLoginModal: !showLoginModal
          })
        }
      >
        <div>i am the modal content!</div>
      </Modal>
    ];
  }
}
