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
        url: "/delete",
        data: { Ma: _xoa }
      })
        .done(function (msg) {
          alert("Chúng tôi đã xóa: " + _xoa)
          window.location.href = "/thietbi"
        });
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
    $('#vattu').hide()
    
    $('#luachon').change(function(){
      $('#loaivt').val($('#luachon').val())
      $('#soluongton').html('')
      //alert($('#luachon').val())
      $.ajax({
        method: "POST",
        url: "/timvattubyloai",
        data: { loai: $('#luachon').val() }
      })
        .done(function (msg) {
          //console.log(msg)
          //alert("Vui lòng chọn Tên Vật Tư")
          // window.location.href = "/thietbi"
          $('#vattu').html(`<option value="" selected disabled hidden>Choose here ...</option>`)
          $('#vattu').show()
          
          $.each(msg, function (i, item) {
            
            $('#vattu').append($('<option>', { 
                value: item.Ma_vattu,
                text : item.Tenvattu 
            }));
        });
        
        });
    })
    
    $('#vattu').change(()=>{
      
      $.ajax({
        method: 'GET',
        url: "/timton/" + $('#vattu').val()
      })
        .done((msg) =>{
          $('#id_tenvattu').val($('#vattu option:selected').text())
          $('#soluongton').html(
             
            '<div> Số lượng nhập: ' + msg.slnhap + '</div>' +
            '<div> Số lượng xuất: ' + msg.slxuat + '</div>' +
            '<div> Số lượng tồn: ' + msg.slton + '</div>'
                                )
        })
    })
    // $('#luunhap').click(() => {
    //   alert('Click Luu Nhap')
    // })
})
