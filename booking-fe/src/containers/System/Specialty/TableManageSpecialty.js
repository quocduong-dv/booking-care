import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import * as actions from '../../../store/actions';
import './TableManageSpecialty.scss';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import { CommonUtils } from '../../../utils';
import { toast } from 'react-toastify';

const mdParser = new MarkdownIt();

class TableManageSpecialty extends Component {

    constructor(props) {
        super(props);
        this.state = {
            listSpecialty: [],
            isEditing: false,
            editId: '',
            name: '',
            imageBase64: '',
            descriptionHTML: '',
            descriptionMarkdown: '',
            type: 'clinic',
            searchKeyword: '',
            currentPage: 1,
            itemsPerPage: 10
        }
    }

    componentDidMount() {
        this.props.fetchAllSpecialty();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.listSpecialty !== this.props.listSpecialty) {
            this.setState({
                listSpecialty: this.props.listSpecialty
            })
        }
    }

    handleDeleteSpecialty = (specialty) => {
        if (window.confirm(`Bạn có chắc muốn xóa chuyên khoa "${specialty.name}"?`)) {
            this.props.deleteSpecialty(specialty.id);
        }
    }

    handleEditSpecialty = (specialty) => {
        this.setState({
            isEditing: true,
            editId: specialty.id,
            name: specialty.name,
            imageBase64: specialty.image || '',
            descriptionHTML: specialty.descriptionHTML || '',
            descriptionMarkdown: specialty.descriptionMarkdown || '',
            type: specialty.type || 'clinic'
        })
    }

    handleCancelEdit = () => {
        this.setState({
            isEditing: false,
            editId: '',
            name: '',
            imageBase64: '',
            descriptionHTML: '',
            descriptionMarkdown: '',
            type: 'clinic'
        })
    }

    handleSaveEdit = () => {
        let { editId, name, imageBase64, descriptionHTML, descriptionMarkdown, type } = this.state;
        if (!name) {
            toast.error("Vui lòng nhập tên chuyên khoa!");
            return;
        }
        this.props.editSpecialty({
            id: editId,
            name,
            imageBase64,
            descriptionHTML,
            descriptionMarkdown,
            type
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
        let { listSpecialty, isEditing, searchKeyword, currentPage, itemsPerPage } = this.state;

        // Filter
        let filtered = listSpecialty.filter(item => {
            const keyword = searchKeyword.toLowerCase();
            return item.name && item.name.toLowerCase().includes(keyword);
        });

        // Pagination
        const indexOfLast = currentPage * itemsPerPage;
        const indexOfFirst = indexOfLast - itemsPerPage;
        const currentItems = filtered.slice(indexOfFirst, indexOfLast);
        const totalPages = Math.ceil(filtered.length / itemsPerPage);

        return (
            <div className="manage-specialty-container">
                <div className="ms-title">Danh sách chuyên khoa</div>

                {isEditing && (
                    <div className="edit-specialty-form">
                        <div className="edit-form-title">Chỉnh sửa chuyên khoa</div>
                        <div className="row">
                            <div className="col-6 form-group">
                                <label>Tên chuyên khoa</label>
                                <input className="form-control" type="text"
                                    value={this.state.name}
                                    onChange={(e) => this.handleOnchangeInput(e, 'name')} />
                            </div>
                            <div className="col-3 form-group">
                                <label>Loại chuyên khoa</label>
                                <select className="form-control"
                                    value={this.state.type}
                                    onChange={(e) => this.handleOnchangeInput(e, 'type')}>
                                    <option value="clinic">Khám tại viện</option>
                                    <option value="remote">Khám từ xa</option>
                                </select>
                            </div>
                            <div className="col-3 form-group">
                                <label>Ảnh chuyên khoa</label>
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
                        placeholder="Tìm kiếm chuyên khoa..."
                        value={searchKeyword}
                        onChange={this.handleSearchChange} />
                </div>

                <table id="TableManageSpecialty">
                    <tbody>
                        <tr>
                            <th>STT</th>
                            <th>Tên chuyên khoa</th>
                            <th>Ảnh</th>
                            <th>Loại chuyên khoa</th>
                            <th>Hành động</th>
                        </tr>
                        {currentItems && currentItems.length > 0 ? (
                            currentItems.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{indexOfFirst + index + 1}</td>
                                        <td>{item.name}</td>
                                        <td>
                                            <div className="specialty-image"
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
                                        <td>
                                            {item.type === 'remote' ? 'Khám từ xa' : 'Khám tại viện'}
                                        </td>
                                        <td>
                                            <button onClick={() => this.handleEditSpecialty(item)}
                                                className="btn-edit"><i className="fas fa-pencil-alt"></i></button>
                                            <button onClick={() => this.handleDeleteSpecialty(item)}
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
                    <div className="specialty-pagination">
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
        listSpecialty: state.admin.allSpecialties
    };
};

const mapDispatchToProps = dispatch => {
    return {
        fetchAllSpecialty: () => dispatch(actions.fetchAllSpecialtyStart()),
        deleteSpecialty: (id) => dispatch(actions.deleteASpecialty(id)),
        editSpecialty: (data) => dispatch(actions.editASpecialty(data)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TableManageSpecialty);
