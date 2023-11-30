

export const decalreFormEvent = (_doApi) => {
  let id_form = document.querySelector("#id_form");
  id_form.addEventListener("submit", (e) => {
    e.preventDefault();

    let dataBody = {
      name: document.querySelector("#id_name").value,
      info: document.querySelector("#id_info").value,

      category: document.querySelector("#id_category").value,
      img_url: document.querySelector("#id_img_url").value,
      price: document.querySelector("#id_price").value,
    }

    console.log(dataBody);
    addNewToy(dataBody, _doApi);
  })
}


const addNewToy = async (_bodyData, _doApi) => {
  let myUrl = "https://lesson-try.onrender.com/tois"
  try {
    let resp = await axios({
      url: myUrl,
      // שיטת השיגור אם פוסט, פוט או דיליט
      method: "POST",
      // הבאדי שנרצה לשלוח
      data: JSON.stringify(_bodyData),
      // כדי שהשרת יבין שזה ג'ייסון
      headers: {
        'content-type': "application/json"
      }
    })
    // אם הצלחנו אנחנו יודעים שנקבל איי די 
    if (resp.data._id) {
      alert("toy added");
      _doApi();
      // לקרוא מחדש לדו איי פי איי שנמצא בקובץ אפ
    }
    else {
      alert("there problem , try again")
    }
  }
  catch (err) {
    console.log(err);
    alert("There problem, come back later")
  }
}