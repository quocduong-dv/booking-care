import express from 'express';
import handbookService from '../servies/handbookService';
let getHandBook = async (req, res) => {
    // Implement the function logic here
    try {
        let infor = await handbookService.getHandBook(req.body);
        return res.status(200).json(
            infor
        )
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
};
let getAllHandBook = async (req, res) => {
    // Implement the function logic here
    try {
        let infor = await handbookService.getAllHandBook({
            q: req.query.q,
            tag: req.query.tag,
            category: req.query.category,
            limit: req.query.limit
        });
        return res.status(200).json(
            infor
        )
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
};
let getDetailHandBookById = async (req, res) => {
    // Implement the function logic here
    try {
        let infor = await handbookService.getDetailHandBookById(req.query.id);
        return res.status(200).json(
            infor
        )
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
};

let editHandBook = async (req, res) => {
    try {
        let infor = await handbookService.editHandBook(req.body);
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}
let deleteHandBook = async (req, res) => {
    try {
        let infor = await handbookService.deleteHandBook(req.body.id);
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}
module.exports = {
    getHandBook: getHandBook,
    getAllHandBook: getAllHandBook,
    getDetailHandBookById: getDetailHandBookById,
    editHandBook: editHandBook,
    deleteHandBook: deleteHandBook
};
