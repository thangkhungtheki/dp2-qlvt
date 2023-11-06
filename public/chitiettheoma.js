
$('document').ready(()=>{
    
    $('#select').hide()
    $('#select1').hide()
    $('#luachonvattu').hide()
    $('#inlineRadio1').click(()=>{
        if($('#inlineRadio1').is(':checked')){ 

            // alert($('#inlineRadio1').val()); 
            // $('#dataTable tbody').html('')
            $('#select').show()
            $('#select1').hide()
            // $('#luachonvattu').show()
        }
    })

    $('#inlineRadio2').click(()=>{
        if($('#inlineRadio2').is(':checked')) { 
            
            // alert($('#inlineRadio2').val()); 
            $('#dataTable tbody').html('')
            $('#select').hide()
            $('#select1').show()
            $('#luachonvattu').hide()
        }
    })
    
    $('#loaivattu').change(function(){
       
        $('#dataTable tbody').html('')
        $.ajax({
          method: "POST",
          url: "/timxuatvattu",
          data: { loai: $('#loaivattu').val() }
        })
        .done(function (msg) {
            $.each(msg, function (i, item) {
                let data = '<tr><td>'+ item.Ma_vattu + '</td><td>' + item.Tenvattu + '</td><td>' + item.username + '</td><td>' + item.soluong + '</td><td>' +  item.ngayxuat + '</td><td>' + item.lydoxuat +'</td></tr'
                $('#dataTable tbody').append(data);
            });
            // Chưa làm được search bảng datatable 
        })
        
        
      })
        
})
// $(function () {
//     $('#dataTable').DataTable();
// })