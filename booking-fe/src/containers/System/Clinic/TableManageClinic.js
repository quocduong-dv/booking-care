import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import * as actions from '../../../store/actions';
import './TableManageClinic.scss';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import { CommonUtils } from '../../../utils';
import { toast } from 'react-toastify';

const mdParser = new MarkdownIt();

class TableManageClinic extends Component {

    constructor(props) {
        super(props);
        this.state = {
            listClinic: [],
            isEditing: false,
            editId: '',
            name: '',
            address: '',
            imageBase64: '',
            descriptionHTML: '',
            descriptionMarkdown: '',
            searchKeyword: '',
            currentPage: 1,
            itemsPerPage: 10
        }
    }

    componentDidMount() {
        this.props.fetchAllClinics();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.listClinic !== this.props.listClinic) {
            this.setState({
                listClinic: this.props.listClinic
            })
        }
    }

    handleDeleteClinic = (clinic) => {
        if (window.confirm(`Bạn có chắc muốn xóa phòng khám "${clinic.name}"?`)) {
            this.props.deleteClinic(clinic.id);
        }
    }

    handleEditClinic = (clinic) => {
        this.setState({
            isEditing: true,
            editId: clinic.id,
            name: clinic.name || '',
            address: clinic.address || '',
            imageBase64: clinic.image || '',
            descriptionHTML: clinic.descriptionHTML || '',
            descriptionMarkdown: clinic.descriptionMarkdown || '',
        })
    }

    handleCancelEdit = () => {
        this.setState({
            isEditing: false,
            editId: '',
            name: '',
            address: '',
            imageBase64: '',
            descriptionHTML: '',
            descriptionMarkdown: '',
        })
    }

    handleSaveEdit = () => {
        let { editId, name, address, imageBase64, descriptionHTML, descriptionMarkdown } = this.state;
        if (!name) {
            toast.error("Vui lòng nhập tên phòng khám!");
            return;
        }
        this.props.editClinic({
            id: editId,
            name,
            address,
            imageBase64,
            descriptionHTML,
            descriptionMarkdown,
        });
        this.handleCancelEdit();
    }

    handleOnchangeInput = (event, id) => {
        this.setState({ [id]: event.target.value });
    }

    handleEditorChange = ({ html, text }) => {
        this.setState({
            descriptionHTML: html,
            descriptionMarkdown: text,
        })
    }

    handleOnchangeImage = async (event) => {
        let file = event.target.files[0];
        if (file) {
            let base64 = await CommonUtils.getBase64(file);
            this.setState({ imageBase64: base64 });
        }
    }

    handleSearchChange = (event) => {
        this.setState({ searchKeyword: event.target.value, currentPage: 1 });
    }

    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    }

    render() {
        let { listClinic, isEditing, searchKeyword, currentPage, itemsPerPage } = this.state;

        let filtered = listClinic.filter(item => {
            const keyword = searchKeyword.toLowerCase();
            return (item.name && item.name.toLowerCase().includes(keyword)) ||
                   (item.address && item.address.toLowerCase().includes(keyword));
        });

        const indexOfLast = currentPage * itemsPerPage;
        const indexOfFirst = indexOfLast - itemsPerPage;
        const currentItems = filtered.slice(indexOfFirst, indexOfLast);
        const totalPages = Math.ceil(filtered.length / itemsPerPage);

        return (
            <div className="manage-clinic-list-container">
                <div className="mc-title">Danh sách phòng khám</div>

                {isEditing && (
                    <div className="edit-clinic-form">
                        <div className="edit-form-title">Chỉnh sửa phòng khám</div>
                        <div className="row">
                            <div className="col-4 form-group">
                                <label>Tên phòng khám</label>
                                <input className="form-control" type="text"
                                    value={this.state.name}
                                    onChange={(e) => this.handleOnchangeInput(e, 'name')} />
                            </div>
                            <div className="col-4 form-group">
                                <label>Địa chỉ</label>
                                <input className="form-control" type="text"
                                    value={this.state.address}
                                    onChange={(e) => this.handleOnchangeInput(e, 'address')} />
                            </div>
                            <div className="col-4 form-group">
                                <label>Ảnh phòng khám</label>
                                <input className="form-control-file" type="file"
                                    onChange={(e) => this.handleOnchangeImage(e)} />
                            </div>
                            <div className="col-12">
                                <MdEditor style={{ height: '250px' }}
                                    renderHTML={text => mdParser.render(text)}
                                    onChange={this.handleEditorChange}
                                    value={this.state.descriptionMarkdown}
                                />
                            </div>
                            <div className="col-12 mt-2">
                                <button className="btn btn-primary mr-2" onClick={this.handleSaveEdit}>
                                    <i className="fas fa-save"></i> Lưu
                                </button>
                                <button className="btn btn-secondary" onClick={this.handleCancelEdit}>
                                    <i className="fas fa-times"></i> Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-3 col-4">
                    <input type="text" className="form-control"
                        placeholder="Tìm kiếm phòng khám..."
                        value={searchKeyword}
                        onChange={this.handleSearchChange} />
                </div>

                <table id="TableManageClinic">
                    <tbody>
                        <tr>
                            <th>STT</th>
                            <th>Tên phòng khám</th>
                            <th>Ảnh</th>
                            <th>Địa chỉ</th>
                            <th>Hành động</th>
                        </tr>
                        {currentItems && currentItems.length > 0 ? (
                            currentItems.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{indexOfFirst + index + 1}</td>
                                        <td>{item.name}</td>
                                        <td>
                                            <div className="clinic-image"
                                                style={{
                                                    backgroundImage: `url(${item.image})`,
                                                    width: '50px',
                                                    height: '50px',
                                                    backgroundSize: 'cover',
                                                    borderRadius: '4px',
                                                    margin: '0 auto'
                                                }}>
                                            </div>
                                        </td>
                                        <td>{item.address}</td>
                                        <td>
                                            <button onClick={() => this.handleEditClinic(item)}
                                                className="btn-edit"><i className="fas fa-pencil-alt"></i></button>
                                            <button onClick={() => this.handleDeleteClinic(item)}
                                                className="btn-delete"><i className="fas fa-trash"></i></button>
                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center" }}>Chưa có dữ liệu</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="clinic-pagination">
                        <button disabled={currentPage === 1}
                            onClick={() => this.handlePageChange(currentPage - 1)}>
                            &laquo;
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i}
                                className={currentPage === i + 1 ? 'active' : ''}
                                onClick={() => this.handlePageChange(i + 1)}>
                                {i + 1}
                            </button>
                        ))}
                        <button disabled={currentPage === totalPages}
                            onClick={() => this.handlePageChange(currentPage + 1)}>
                            &raquo;
                        </button>
                    </div>
                )}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        listClinic: state.admin.allClinics
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchAllClinics: () => dispatch(actions.fetchAllClinicsStart()),
        deleteClinic: (id) => dispatch(actions.deleteAClinic(id)),
        editClinic: (data) => dispatch(actions.editAClinic(data)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TableManageClinic);
