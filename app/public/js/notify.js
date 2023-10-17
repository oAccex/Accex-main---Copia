function notify(titulo, texto, tipo, posicao) {
    new Notify({
        status: tipo,
        title: titulo,
        text:texto ,
        effect: 'fade',
        speed: 300,
        showIcon: true,
        showCloseButton: true,
        autoclose: true,
        autotimeout: 3000,
        gap: 20,
        distance: 20,
        type: 1,
        position:posicao 
    })
}