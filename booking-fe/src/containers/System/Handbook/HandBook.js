import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import './HandBook.scss';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import { CommonUtils } from '../../../utils';
import { getCreateHandBook } from "../../../services/userService";
import { toast } from "react-toastify";
//
const mdParser = new MarkdownIt(/* Markdown-it options */);
class HandBook extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            imageBase64: '',
            descriptionHTML: '',
            descriptionMarkdown: '',

        }
    }
    async componentDidMount() {


    }


    async componentDidUpdate(prevProps, prevState, snapshot) {
        // tạo thay đổi ngôn ngữ 
        if (this.props.language !== prevProps.language) {

        }

    }
    handleOnchangeInput = (event, id) => {
        let stateCopy = { ...this.state }
        stateCopy[id] = event.target.value;
        this.setState({
            ...stateCopy
        })
    }
    handleEditorChange = ({ html, text }) => {
        this.setState({
            descriptionHTML: html,
            descriptionMarkdown: text,
        })
    }
    handleOnchangeImage = async (event) => {
        let data = event.target.files;
        let file = data[0];
        if (file) {
            let base64 = await CommonUtils.getBase64(file);
            this.setState({
                imageBase64: base64

            })

        }
    }
    handleSaveNewHandbook = async () => {
        let res = await getCreateHandBook(this.state)
        if (res && res.errCode === 0) {
            toast.success("Add new handbook success! ");
            //delete data after  data success
            this.setState({
                name: '',
                imageBase64: '',
                descriptionHTML: '',
                descriptionMarkdown: '',
            })
        } else {
            toast.error("Something wrongs... ! ");
            console.log('check ??>>>>', res)
        }

    }

    render() {

        return (
            <div className="manage-specialty-container">
                <div className="ms-title">Quản lý Cẩm Nang</div>

                <div className="add-new-specialty row">
                    <div className="col-6 form-group">
                        <label>Tên Cẩm nang</label>
                        <input className="form-control" type="text" value={this.state.name}
                            onChange={(event) => this.handleOnchangeInput(event, 'name')} />
                    </div>
                    <div className="col-6 form-group">
                        <label className="d-block">Ảnh cẩm nang</label>
                        <input className="form-control-file" type="file"
                            onChange={(event) => this.handleOnchangeImage(event)}

                        />
                    </div>

                    <div className="col-12">
                        <br></br>
                        <MdEditor style={{ height: '300px' }}
                            renderHTML={text => mdParser.render(text)}
                            onChange={this.handleEditorChange}
                            value={this.state.descriptionMarkdown}
                        />
                    </div>
                    <div className="col-12">
                        <button className="btn-save-specialty"
                            onClick={() => this.handleSaveNewHandbook()}
                        >Save</button>
                    </div>

                </div>

            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(HandBook);
