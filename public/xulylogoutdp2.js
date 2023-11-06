$('document').ready(()=>{
    $('#btnlogout').click(()=>{
        $.ajax({
            method: "POST",
            url: "/logout",
            //data: { name: "John", location: "Boston" }
          })
            .done(function( msg ) {
              window.location.href = "/signin"
            });
    }),
    $('#btndelete').click(() => {
      $.ajax({
        method: "POST",
        url: "/deletedp2",
        data: { Ma: _xoa }
      })
        .done(function (msg) {
          alert("Chúng tôi đã xóa: " + _xoa)
          window.location.href = "/thietbidp2"
        });
    }),
    $('#btnxem').click(()=>{
      window.location.href = "/viewcreatethietbi"
    })
    // $("#btnsua").click(() => {
    //   $.ajax({
    //     method: "POST",
    //     url: "/searchedit",
    //     txtsearch: _xoa,
    //   })
    //   .done(function (msg) {
    //     window.location.href = "/searchedit"
    //   });
    // })
})