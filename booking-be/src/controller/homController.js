import db from '../models/index';
import CRUDService from '../servies/CRUDService';

let getHomPage = async (req, res) => {
    try {
        let data = await db.User.findAll(); // findAll là tìm all dữ liệu trong bảng csdl user


        return res.render('homepage.ejs', {
            data: JSON.stringify(data)
        });
    } catch (e) {
        console.log(e)
    }

}
let getAboutPage = (req, res) => {
    return res.render('test/about.ejs');
}
let getCRUD = (req, res) => {
    return res.render('crud.ejs');
}
let postCRUD = async (req, res) => {
    let message = await CRUDService.createNewUser(req.body);
    console.log(message);
    return res.send('post crud from server');
}
let displayGetCRUD = async (req, res) => {
    let data = await CRUDService.getAllUser();
    console.log('-----------------------------');
    console.log(data);
    console.log('-----------------------------');
    return res.render('displayCRUD.ejs', {

        dataTable: data,
    })
}
let getEditCRUD = async (req, res) => {
    let useId = req.query.id;
    console.log(useId)
    if (useId) {

        let userData = await CRUDService.getUserInfoById(useId);


        // let userData
        return res.render('editCRUD.ejs', {
            user: userData  // lấy từ userData gán cho user và truyền qua view
        });

    } else {


        return res.send('User not found!');
    }
}
let putCRUD = async (req, res) => {
    let data = req.body; // lấy đc tất cả các input đặt name 
    let allUsers = await CRUDService.updateUserData(data);
    return res.render('displayCRUD.ejs', {

        dataTable: allUsers,
    })
}
let deleteCRUD = async (req, res) => {
    let id = req.query.id;
    if (id) {


        await CRUDService.deleteUserById(id);
        return res.send('delete the user succeed !')
    } else {
        return res.send(' the user not found !')
    }


}
module.exports = {
    getHomPage: getHomPage,
    getAboutPage: getAboutPage,
    getCRUD: getCRUD,
    postCRUD: postCRUD,
    displayGetCRUD: displayGetCRUD,
    getEditCRUD: getEditCRUD,
    putCRUD: putCRUD,
    deleteCRUD: deleteCRUD,
}