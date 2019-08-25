const spinner = document.querySelector('.fullspinner');
const load = document.createElement('DIV');
load.classList.add('card');
load.classList.add('spinner');
const content = document.querySelector('#main');
let jwt;

// check if jwt exist
if (sessionStorage.getItem('jwt')) {
    jwt = sessionStorage.getItem('jwt');
}
if (localStorage.getItem('jwt')) {
    jwt = localStorage.getItem('jwt');
}
if (jwt == null) {
    window.location.href = 'login.html';
}

const personaldata = document.createElement('DIV');
personaldata.classList.add('card');

let jwtdata = decodeToken(jwt).data;
const userdata =
    '<br>' +
    '<h2>Persönliche Daten:</h2>' +
    '<br>' +
    '<b>Schule:</b> ' +
    jwtdata.school +
    ' (' +
    jwtdata.type +
    ')<br>' +
    '<br>' +
    '<b>Name:</b> ' +
    jwtdata.lastname +
    ', ' +
    jwtdata.firstname +
    '<br>' +
    '<br>' +
    '<b>Email:</b> ' +
    jwtdata.email +
    '<br>' +
    '<br>' +
    '<b>Benutzername:</b> ' +
    jwtdata.username +
    '<br>' +
    '<br>';

personaldata.innerHTML = userdata;
content.insertBefore(personaldata, spinner);

// --------- Passwort ändern ---------

const changePassword = document.createElement('DIV');
changePassword.classList.add('card');
changePassword.innerHTML =
    '<br><h4>Passwort ändern? Dann klick <a href="forgotpassword.html" style="color: blue; text-decoration: underline;">hier</a></h4><br>';
content.insertBefore(changePassword, spinner);

// --------- Schüler Daten laden ---------
let studentdata;

if (jwtdata.type == 'STNT') {
    let studentDataUrl = 'api/get_student_data.php';
    let studentexist = true;
    fetch(studentDataUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + jwt
        }
    })
        .then(res => res.json())
        .then(response => {
            console.log('Success:', JSON.stringify(response));

            studentdata = document.createElement('DIV');
            studentdata.classList.add('card');

            if (!response.error) {
                studentdata.innerHTML =
                    '<br>' +
                    '<h2>Schüler Daten:</h2>' +
                    '<br>' +
                    '<b>Name:</b> ' +
                    response.pub_name +
                    '<br>' +
                    '<br>' +
                    '<b>Jahrgang:</b> ' +
                    response.year +
                    '<br>' +
                    '<br><form id="edit_student_class">' +
                    '<b>Klasse/Tutorium:</b> ' +
                    response.class +
                    '<br>' +
                    '<input type="submit" value="Bearbeiten" /></form>';
            } else if (response.error && response.error_code == 1) {
                studentdata.innerHTML =
                    '<br/>' +
                    '<h3>Neu hier?:</h3>' +
                    '<br/>' +
                    '<form id="create_student">' +
                    '    <label for="year">Dann gib dein Jahrgang hier an:</label>' +
                    '    <select name="year" id="year">' +
                    '        <option value="7">7</option>' +
                    '        <option value="8">8</option>' +
                    '        <option value="9">9</option>' +
                    '        <option value="10">10</option>' +
                    '        <option value="11">11</option>' +
                    '        <option value="12">12</option>' +
                    '    </select>' +
                    '    <br/>' +
                    '    <input type="submit" value="Speichern" />' +
                    '</form>';
                studentexist = false;
            } else {
                studentdata.classList.add('error');
                studentdata.innerHTML = response.message;
            }
            content.insertBefore(studentdata, spinner);
            if (studentexist == true && response.error == false) {
                document
                    .querySelector('#edit_student_class')
                    .addEventListener('submit', onEditClass);
            } else if (studentexist == false) {
                document
                    .querySelector('#create_student')
                    .addEventListener('submit', onCreateStudent);
            }
        })
        .catch(error => console.error('Error:', error));
}

// --------- Schüler Kurse ---------
let studentcourses;
let coursesofstudent;

if (jwtdata.type == 'STNT') {
    let studentCoursesUrl = 'api/get_courses_of_student.php';
    fetch(studentCoursesUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + jwt
        }
    })
        .then(res => res.json())
        .then(response => {
            console.log('Success:', JSON.stringify(response));

            studentcourses = document.createElement('DIV');
            studentcourses.classList.add('card');

            if (!response.error) {
                let tempString;
                coursesofstudent = response.courses;

                tempString = '<br><h2>Kurse:</h2>';
                for (let i = 0; i < response.courses.length; i++) {
                    const row = response.courses[i];
                    tempString += '<br> - ' + row.name;
                }
                tempString +=
                    '<br/><form id="edit_student_course"><input type="submit" value="Bearbeiten" /></form>';

                studentcourses.innerHTML = tempString;
                content.insertBefore(studentcourses, spinner);
                document
                    .querySelector('#edit_student_course')
                    .addEventListener('submit', onEditCourse);
            } else {
                studentcourses.classList.add('error');
                studentcourses.innerHTML = response.message;
                content.insertBefore(studentcourses, spinner);
            }
        })
        .catch(error => console.error('Error:', error));
}

// --------- Settings bearbeiten ---------
let settingscard;
let sub_settings;

let settingsUrl = 'api/get_settings.php';
fetch(settingsUrl, {
    method: 'GET',
    mode: 'cors',
    headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + jwt
    }
})
    .then(res => res.json())
    .then(response => {
        console.log('Success:', JSON.stringify(response));

        settingscard = document.createElement('DIV');
        settingscard.classList.add('card');

        if (!response.error) {
            let tempString;
            sub_settings = JSON.parse(response.subject_settings);

            tempString = '<br><h2>Einstellungen:</h2>';
            tempString += '<br><h3>Fächer-farben:</h3>';
            for (subject in sub_settings) {
                tempString +=
                    '<br> - <b>' +
                    subject +
                    ':</b> <font color="' +
                    sub_settings[subject] +
                    '">' +
                    sub_settings[subject] +
                    '</font>';
            }

            tempString +=
                '<br/><form id="show_settings"><input type="submit" value="Bearbeiten" /></form>';

            settingscard.innerHTML = tempString;
            content.insertBefore(settingscard, spinner);
            document
                .querySelector('#show_settings')
                .addEventListener('submit', onEditSettings);
        } else {
            settingscard.classList.add('error');
            settingscard.innerHTML = response.message;
            content.insertBefore(settingscard, spinner);
        }
    })
    .catch(error => console.error('Error:', error));

//content.removeChild(spinner);

var color_settings;

// edit settings
function onEditSettings(e) {
    let getSubjectsUrl = 'api/get_subjects.php';

    e.preventDefault();
    console.log('submitted');

    content.insertBefore(load, settingscard.nextSibling);
    fetch(getSubjectsUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + jwt
        }
    })
        .then(res => res.json())
        .then(response => {
            console.log('Success:', JSON.stringify(response));
            content.removeChild(load);

            if (!response.error) {
                let tempString;
                let dropdown;

                for (let i = 0; i < response.subjects.length; i++) {
                    const row = response.subjects[i];
                    dropdown +=
                        '<option value="' +
                        row.short +
                        '">' +
                        row.name +
                        '</option>';
                }

                tempString = '<br><h2>Einstellungen:</h2>';
                tempString +=
                    '<br><h3>Fächer-farben:</h3><form id="edit_settings"><div id="color_settings">';
                for (subject in sub_settings) {
                    tempString +=
                        '<p subject="' +
                        subject +
                        '"><br> - <b>' +
                        subject +
                        ':</b> <input type="color" value="' +
                        sub_settings[subject] +
                        '"></p>';
                }

                tempString +=
                    '</div><br/><label for="new_subject_color"><b>Weiteres Fach:</b></label>' +
                    '<select name="new_subject_color" id="new_subject_color_select">' +
                    dropdown +
                    '</select><input id="new_subject_color" class="btn" type="button" value="Hinzufügen/Entfernen" /><br>';

                tempString +=
                    '<br/><input type="submit" value="Speichern" /></form>';

                settingscard.innerHTML = tempString;
                color_settings = document.querySelectorAll('p[subject]');
                document
                    .querySelector('#new_subject_color')
                    .addEventListener('click', onClickNewColor);
                document
                    .querySelector('#edit_settings')
                    .addEventListener('submit', onSaveSettings);
            } else {
                settingscard.classList.add('error');
                settingscard.innerHTML = response.message;
                content.insertBefore(settingscard, spinner);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            const msg = document.createElement('DIV');
            msg.classList.add('card');
            msg.classList.add('error');
            msg.innerHTML = 'Fehler';
            content.insertBefore(msg, settingscard.nextSibling);

            setTimeout(() => {
                content.removeChild(msg);
            }, 5000);
            content.removeChild(load);
        });
}

// save new color
function onSaveSettings(e) {
    let setSettingsUrl = 'api/set_settings.php';
    let subsetObject = {};
    e.preventDefault();
    console.log('submitted');

    content.insertBefore(load, settingscard.nextSibling);

    for (let i = 0; i < color_settings.length; i++) {
        const subset = color_settings[i];
        subsetObject[subset.getAttribute('subject')] = subset.querySelector(
            'input'
        ).value;
    }

    var data = {
        subject_settings: JSON.stringify(subsetObject)
    };
    fetch(setSettingsUrl, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + jwt
        }
    })
        .then(res => res.json())
        .then(response => {
            console.log('Success:', JSON.stringify(response));

            if (response.error) {
                const msg = document.createElement('DIV');
                msg.classList.add('card');
                msg.classList.add('error');
                msg.innerHTML = response.message;
                content.insertBefore(msg, settingscard.nextSibling);

                setTimeout(() => {
                    content.removeChild(msg);
                }, 5000);
            } else {
                location.reload();
            }
            content.removeChild(load);
        })
        .catch(error => {
            console.error('Error:', error);
            const msg = document.createElement('DIV');
            msg.classList.add('card');
            msg.classList.add('error');
            msg.innerHTML = 'Fehler';
            content.insertBefore(msg, settingscard.nextSibling);

            setTimeout(() => {
                content.removeChild(msg);
            }, 5000);
            content.removeChild(load);
        });
}

// add new element for new color
function onClickNewColor(e) {
    e.preventDefault();
    console.log('clicked');
    for (let i = 0; i < color_settings.length; i++) {
        const subset = color_settings[i];
        if (
            subset.getAttribute('subject') ==
            document.querySelector('#new_subject_color_select').value
        ) {
            document.querySelector('div#color_settings').removeChild(subset);
            color_settings = document.querySelectorAll('p[subject]');
            return;
        }
    }

    let newColorElement = document.createElement('p');
    newColorElement.setAttribute(
        'subject',
        document.querySelector('#new_subject_color_select').value
    );
    newColorElement.innerHTML =
        '<br> - <b>' +
        document.querySelector('#new_subject_color_select').value +
        ':</b> <input type="color" value="#000000"></p>';
    document.querySelector('#color_settings').appendChild(newColorElement);
    color_settings = document.querySelectorAll('p[subject]');
}

// get possible courses
function onEditCourse(e) {
    let getCoursesUrl = 'api/get_courses.php';

    e.preventDefault();
    console.log('submitted');

    content.insertBefore(load, studentcourses.nextSibling);

    fetch(getCoursesUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + jwt
        }
    })
        .then(res => res.json())
        .then(response => {
            console.log('Success:', JSON.stringify(response));
            content.removeChild(load);
            if (response.error) {
                const msg = document.createElement('DIV');
                msg.classList.add('card');
                msg.classList.add('error');
                msg.innerHTML = response.message;
                content.insertBefore(msg, studentcourses.nextSibling);

                setTimeout(() => {
                    content.removeChild(msg);
                }, 5000);
            } else {
                let selectaddcourseform = document.createElement('form');
                let selectremovecourseform = document.createElement('form');
                let tempString;

                tempString =
                    '<br><label for="course_old"><b>Zu entfernender Kurs:</b></label>' +
                    '<select name="course_old" id="course_old_select">';
                for (let i = 0; i < coursesofstudent.length; i++) {
                    const row = coursesofstudent[i];
                    tempString =
                        tempString +
                        '<option value="' +
                        row.id +
                        '">' +
                        row.name +
                        '</option>';
                }
                tempString =
                    tempString +
                    '</select><input type="submit" value="Entfernen" />';
                selectremovecourseform.innerHTML = tempString;
                tempString =
                    '<br><label for="course"><b>Neuer Kurs:</b></label>' +
                    '<select name="course" id="course_select">';
                for (let i = 0; i < response.courses.length; i++) {
                    const row = response.courses[i];
                    tempString =
                        tempString +
                        '<option value="' +
                        row.id +
                        '">' +
                        row.name +
                        '</option>';
                }
                tempString =
                    tempString +
                    '</select><input type="submit" value="Speichern" />';

                selectaddcourseform.innerHTML = tempString;
                studentcourses.replaceChild(
                    selectaddcourseform,
                    document.querySelector('#edit_student_course')
                );
                studentcourses.insertBefore(
                    selectremovecourseform,
                    selectaddcourseform
                );
                selectremovecourseform.addEventListener(
                    'submit',
                    onRemoveCourse
                );
                selectaddcourseform.addEventListener('submit', onAddCourse);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            const msg = document.createElement('DIV');
            msg.classList.add('card');
            msg.classList.add('error');
            msg.innerHTML = 'Fehler';
            content.insertBefore(msg, studentcourses.nextSibling);

            setTimeout(() => {
                content.removeChild(msg);
            }, 5000);
            content.removeChild(load);
        });
}

// remove student course
function onRemoveCourse(e) {
    let removeCourseUrl = 'api/remove_course.php';

    e.preventDefault();
    console.log('submitted');

    content.insertBefore(load, studentcourses.nextSibling);

    const data = {
        course_id: document.querySelector('#course_old_select').value
    };
    fetch(removeCourseUrl, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + jwt
        }
    })
        .then(res => res.json())
        .then(response => {
            console.log('Success:', JSON.stringify(response));

            if (response.error) {
                const msg = document.createElement('DIV');
                msg.classList.add('card');
                msg.classList.add('error');
                msg.innerHTML = response.message;
                content.insertBefore(msg, studentcourses.nextSibling);

                setTimeout(() => {
                    content.removeChild(msg);
                }, 5000);
            } else {
                location.reload();
            }
            content.removeChild(load);
        })
        .catch(error => {
            console.error('Error:', error);
            const msg = document.createElement('DIV');
            msg.classList.add('card');
            msg.classList.add('error');
            msg.innerHTML = 'Fehler';
            content.insertBefore(msg, studentcourses.nextSibling);

            setTimeout(() => {
                content.removeChild(msg);
            }, 5000);
            content.removeChild(load);
        });
}

// add student course
function onAddCourse(e) {
    let setCourseUrl = 'api/set_course.php';

    e.preventDefault();
    console.log('submitted');

    content.insertBefore(load, studentcourses.nextSibling);

    const data = {
        course_id: document.querySelector('#course_select').value
    };
    fetch(setCourseUrl, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + jwt
        }
    })
        .then(res => res.json())
        .then(response => {
            console.log('Success:', JSON.stringify(response));

            if (response.error) {
                const msg = document.createElement('DIV');
                msg.classList.add('card');
                msg.classList.add('error');
                msg.innerHTML = response.message;
                content.insertBefore(msg, studentcourses.nextSibling);

                setTimeout(() => {
                    content.removeChild(msg);
                }, 5000);
            } else {
                location.reload();
            }
            content.removeChild(load);
        })
        .catch(error => {
            console.error('Error:', error);
            const msg = document.createElement('DIV');
            msg.classList.add('card');
            msg.classList.add('error');
            msg.innerHTML = 'Fehler';
            content.insertBefore(msg, studentcourses.nextSibling);

            setTimeout(() => {
                content.removeChild(msg);
            }, 5000);
            content.removeChild(load);
        });
}

// get possible classes for student
function onEditClass(e) {
    let getClassesUrl = 'api/get_classes.php';

    e.preventDefault();
    console.log('submitted');

    content.insertBefore(load, studentdata.nextSibling);

    fetch(getClassesUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + jwt
        }
    })
        .then(res => res.json())
        .then(response => {
            console.log('Success:', JSON.stringify(response));
            content.removeChild(load);
            if (response.error) {
                const msg = document.createElement('DIV');
                msg.classList.add('card');
                msg.classList.add('error');
                msg.innerHTML = response.message;
                content.insertBefore(msg, studentdata.nextSibling);

                setTimeout(() => {
                    content.removeChild(msg);
                }, 5000);
            } else {
                let selectclassform = document.createElement('form');
                let tempString;

                tempString =
                    '<label for="class"><b>Klasse/Tutorium:</b></label>' +
                    '<select name="class" id="class_select">';
                for (let i = 0; i < response.classes.length; i++) {
                    const row = response.classes[i];
                    tempString =
                        tempString +
                        '<option value="' +
                        row.id +
                        '">' +
                        row.name +
                        '</option>';
                }
                tempString =
                    tempString +
                    '</select>' +
                    '<br/>' +
                    '<input type="submit" value="Speichern" />';

                selectclassform.innerHTML = tempString;
                studentdata.replaceChild(
                    selectclassform,
                    document.querySelector('#edit_student_class')
                );
                selectclassform.addEventListener('submit', onSaveClass);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            const msg = document.createElement('DIV');
            msg.classList.add('card');
            msg.classList.add('error');
            msg.innerHTML = 'Fehler';
            content.insertBefore(msg, studentdata.nextSibling);

            setTimeout(() => {
                content.removeChild(msg);
            }, 5000);
            content.removeChild(load);
        });
}

// save student class
function onSaveClass(e) {
    let saveClassUrl = 'api/set_class.php';

    e.preventDefault();
    console.log('submitted');

    content.insertBefore(load, studentdata.nextSibling);

    const data = {
        class_id: document.querySelector('#class_select').value
    };
    fetch(saveClassUrl, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(data), // data can be `string` or {object}!
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + jwt
        }
    })
        .then(res => res.json())
        .then(response => {
            console.log('Success:', JSON.stringify(response));

            if (response.error) {
                const msg = document.createElement('DIV');
                msg.classList.add('card');
                msg.classList.add('error');
                msg.innerHTML = response.message;
                content.insertBefore(msg, studentdata.nextSibling);

                setTimeout(() => {
                    content.removeChild(msg);
                }, 5000);
            } else {
                location.reload();
            }
            content.removeChild(load);
        })
        .catch(error => {
            console.error('Error:', error);
            const msg = document.createElement('DIV');
            msg.classList.add('card');
            msg.classList.add('error');
            msg.innerHTML = 'Fehler';
            content.insertBefore(msg, studentdata.nextSibling);

            setTimeout(() => {
                content.removeChild(msg);
            }, 5000);
            content.removeChild(load);
        });
}

// Create student and set year
function onCreateStudent(e) {
    let createStudenUrl = 'api/create_student.php';

    e.preventDefault();
    console.log('submitted');

    content.insertBefore(load, studentdata.nextSibling);

    if (document.querySelector('#year').value == '') {
        console.log('field is missing');
        const msg = document.createElement('DIV');
        msg.classList.add('card');
        msg.classList.add('warning');
        msg.innerHTML = 'Bitte alle benötigten Felder ausfüllen!';
        content.insertBefore(msg, studentdata.nextSibling);

        setTimeout(() => {
            content.removeChild(msg);
        }, 3000);
        content.removeChild(load);
        return;
    } else {
        const data = {
            year: document.querySelector('#year').value
        };

        fetch(createStudenUrl, {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify(data), // data can be `string` or {object}!
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + jwt
            }
        })
            .then(res => res.json())
            .then(response => {
                console.log('Success:', JSON.stringify(response));

                if (response.error) {
                    const msg = document.createElement('DIV');
                    msg.classList.add('card');
                    msg.classList.add('error');
                    msg.innerHTML = response.message;
                    content.insertBefore(msg, studentdata.nextSibling);

                    setTimeout(() => {
                        content.removeChild(msg);
                    }, 5000);
                } else {
                    location.reload();
                }
                content.removeChild(load);
            })
            .catch(error => {
                console.error('Error:', error);
                const msg = document.createElement('DIV');
                msg.classList.add('card');
                msg.classList.add('error');
                msg.innerHTML = 'Fehler';
                content.insertBefore(msg, studentdata.nextSibling);

                setTimeout(() => {
                    content.removeChild(msg);
                }, 5000);
                content.removeChild(load);
            });
    }
}

function decodeToken(token) {
    var payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
}
