export default class CountryClass{
  constructor(_parent,_item,_index,_doApi) {
    this.parent = _parent;
    this.name = _item.name;
    this.info = _item.info;
    this.category = _item.category;
    this.price = _item.price;
    this.img_url = _item.img_url;
    this.index = _index;
    this.id = _item._id;
    this.doApi = _doApi;
  }

  render(){
    let tr = document.createElement("tr");
    document.querySelector(this.parent).append(tr);

    tr.innerHTML = `
    <td>${this.index + 1}</td>
    <td>${this.name}</td>
    <td>${this.pop.toLocaleString()}</td>
    <td>${this.capital}</td>
    <td><button class="badge bg-danger del-btn">Del</button></td>
    `

    let delBtn = tr.querySelector(".del-btn");
    delBtn.addEventListener("click" , () => {
      // alert(this.id);
      confirm("Are you sure you want to delete?") && this.delCountry()
    })
  }

  async delCountry(){
    let url = "https://lesson-try.onrender.com/tois/"+this.id;
    try{

      let resp =  await axios({
        url,
        method:"DELETE",
        headers:{
          'content-type': "application/json"
        }
      })
      if(resp.data.deletedCount == 1){
        
        this.doApi();
      }
      else{
        alert("There problem")
      }
    }
    catch(err){
      console.log(err);
      alert("There problem, come back later")
    }
  }
}