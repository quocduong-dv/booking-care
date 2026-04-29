import { query } from "express";
import specialtyService from "../servies/specialtyService";

let createSpecialty = async (req, res) => {
    // Implement the function logic here
    try {
        let infor = await specialtyService.createSpecialty(req.body);
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
let getAllSpecialty = async (req, res) => {
    // Implement the function logic here
    try {
        let infor = await specialtyService.getAllSpecialty(req.query.type);
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
let getDetailSpecialtyById = async (req, res) => {
    try {
        let infor = await specialtyService.getDetailSpecialtyById(req.query.id, req.query.location);
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
}
let editSpecialty = async (req, res) => {
    try {
        let infor = await specialtyService.editSpecialty(req.body);
        return res.status(200).json(infor)
    } catch (e) {
        console.log(e)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from the server...'
        })
    }
}
let deleteSpecialty = async (req, res) => {
    try {
        let infor = await specialtyService.deleteSpecialty(req.body.id);
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
    createSpecialty: createSpecialty,
    getAllSpecialty: getAllSpecialty,
    getDetailSpecialtyById: getDetailSpecialtyById,
    editSpecialty: editSpecialty,
    deleteSpecialty: deleteSpecialty
};
