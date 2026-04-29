import React, { Component } from 'react';
import { connect } from "react-redux";
import { FormattedMessage } from 'react-intl';
import './ManageSpeciatly.scss';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import { CommonUtils } from '../../../utils';
import { createNewSpecialty } from "../../../services/userService";
import { toast } from "react-toastify";
//
const mdParser = new MarkdownIt(/* Markdown-it options */);
class ManageSpeciatly extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            imageBase64: '',
            descriptionHTML: '',
            descriptionMarkdown: '',
            type: 'clinic' // Default value
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
    handleSaveNewSpecialty = async () => {
        let res = await createNewSpecialty(this.state)
        if (res && res.errCode === 0) {
            toast.success("Add new specialty success! ");
            //delete data after  data success
            this.setState({
                name: '',
                imageBase64: '',
                descriptionHTML: '',
                descriptionMarkdown: '',
                type: 'clinic'
            })
        } else {
            toast.error("Something wrongs... ! ");
            console.log('check ??>>>>', res)
        }

    }

    render() {

        return (
            <div className="manage-specialty-container">
                <div className="ms-title">Quản lý chuyên khoa</div>

                <div className="add-new-specialty row">
                    <div className="col-6 form-group">
                        <label>Tên chuyên khoa</label>
                        <input className="form-control" type="text" value={this.state.name}
                            onChange={(event) => this.handleOnchangeInput(event, 'name')} />
                    </div>
                    <div className="col-6 form-group">
                        <label className="d-block">Ảnh chuyên khoa</label>
                        <input className="form-control-file" type="file"
                            onChange={(event) => this.handleOnchangeImage(event)}

                        />
                    </div>
                    <div className="col-6 form-group">
                        <label>Loại chuyên khoa</label>
                        <select className="form-control"
                            value={this.state.type}
                            onChange={(event) => this.handleOnchangeInput(event, 'type')}
                        >
                            <option value="clinic">Khám tại viện</option>
                            <option value="remote">Khám từ xa</option>
                        </select>
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
                            onClick={() => this.handleSaveNewSpecialty()}
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

export default connect(mapStateToProps, mapDispatchToProps)(ManageSpeciatly);
