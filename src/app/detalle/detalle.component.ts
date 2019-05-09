import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LugaresService } from "../services/lugares.service";
import { Observable } from 'rxjs';
import { AngularFireStorage } from 'angularfire2/storage';
import { AutorizacionService } from '../services/autorizacion.service';
import { ArticulosService } from '../services/articulos.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faDollarSign } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: "app-detalle",
  templateUrl: "./detalle.component.html"
})
export class DetalleComponent {
  id = null;
  lugar: any = {};
  articulos: any = {};
  nombre = null;
  profileUrl: Observable<string | null>;
  loggedUser:any = null;
  usuariolat:any;
  usuariolng:any;
  loggedIn = false;
  imgsArt:any = {};
  usuarioDB:any = {};
  lugarUsr:any = {};
  resenia: any = {};
  reseniaAutor: any = {};
  resenias: any = {};
  faStar = faStar;
  faDollarSign = faDollarSign;
  constructor (private autorizacionService:AutorizacionService, private storage: AngularFireStorage, private route:ActivatedRoute, private lugaresService:LugaresService, private articuloService:ArticulosService, private angularFireAuth: AngularFireAuth){
    this.id = this.route.snapshot.params['id'];
    const ref = this.storage.ref('atracciones/' + this.id);
    this.profileUrl = ref.getDownloadURL();
    this.lugaresService.buscarlugar(this.id).
    valueChanges().
    subscribe(lugar => {
      this.lugar = lugar;
    });
    this.articuloService.getArticulos().
    valueChanges().
    subscribe(articulos => {
      this.articulos = articulos;
    });
    this.lugaresService.obtenerResenias(this.id).
    valueChanges().
    subscribe(resenias => {
      this.resenias = resenias;
    });
    this.autorizacionService.isLogged()
    .subscribe((result) => {
      if(result && result.uid){
        this.loggedIn = true;
        setTimeout(() => {
          this.loggedUser = this.autorizacionService.getUser().currentUser.uid;
          this.autorizacionService.obtenerUsuario()
          .valueChanges().
          subscribe(usuarioDB => {
            this.usuarioDB = usuarioDB;
          });
        }, 500);
        this.autorizacionService.obtenerLugarUsr(this.id)
          .valueChanges().
          subscribe((lugarUsr) => {
            if (lugarUsr != null) {
              this.lugarUsr = lugarUsr;
            } else {
              this.autorizacionService.quitarFavorito(this.id);
              this.autorizacionService.rehacerResenia(this.id);
              this.autorizacionService.quitarEstoyAqui(this.id);
              this.lugarUsr = lugarUsr;
            }
          });
      } else {
        this.loggedIn = false;
      }
    }, (error) => {
      this.loggedIn = false;
    })
    navigator.geolocation.getCurrentPosition(this.mostrar);
  }

  public mostrar(pos) {
    this.usuariolat = pos.coords.latitude;
    this.usuariolng = pos.coords.longitude;
  }

  public favorita(){
    this.autorizacionService.agregarFavorito(this.id);
    alert("Ahora es una atracción favorita");
  }

  public noFavorita() {
    this.autorizacionService.quitarFavorito(this.id);
    alert("Ya no es una atracción favorita");
  }

  public estoyAqui(){
    this.autorizacionService.agregarEstoyAqui(this.id);
    alert("Ahora visitaste este lugar");
  }

  public guardarResenia() {
    this.resenia.propietario = this.angularFireAuth.auth.currentUser.uid;
    this.resenia.id = this.angularFireAuth.auth.currentUser.uid;
    this.lugaresService.guardarResenia(this.resenia, this.lugar);
    alert("Reseña creada con exito");
  }

  public rehacerResenia(idUsr) {
    this.lugaresService.borrarResenia(this.id, idUsr);
    alert("Puedes crear una nueva reseña");
  }

  public traerUsuarioEspecifico(id) {
    return this.autorizacionService.obtenerUsuarioEspecifico(id);
  }

  public range(start, stop, step) {
    if (typeof stop == 'undefined') {
        stop = start;
        start = 0;
    }

    if (typeof step == 'undefined') {
        step = 1;
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return [];
    }

    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }

    return result;
  }
}

