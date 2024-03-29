import { Component } from "@angular/core";
import { LugaresService } from "../services/lugares.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable } from "rxjs";
import { AngularFireStorage } from "angularfire2/storage";
import { AngularFireAuth } from "angularfire2/auth";
import swal from "sweetalert2";

@Component({
  selector: "app-crear",
  templateUrl: "./crear.component.html"
})
export class CrearComponent {
  lugar: any = {};
  id: any = null;
  file: any = null;
  newFile: Boolean = false;
  constructor(
    private lugaresService: LugaresService,
    private route: ActivatedRoute,
    private storage: AngularFireStorage,
    private angularFireAuth: AngularFireAuth,
    private router: Router
  ) {
    this.id = this.route.snapshot.params["id"];
    if (this.id != "new") {
      this.lugaresService
        .getLugar(this.id)
        .valueChanges()
        .subscribe(lugar => {
          this.lugar = lugar;
        });
    }
  }

  guardarLugar() {
    var direccion =
      this.lugar.calle + "," + this.lugar.ciudad + "," + this.lugar.pais;
    this.lugaresService.obtenerGeoData(direccion).subscribe((result: any) => {
      this.lugar.lat = result.results[0].geometry.location.lat;
      this.lugar.lng = result.results[0].geometry.location.lng;
      if (this.id != "new") {
        this.lugaresService.editarLugar(this.lugar);
        if (this.newFile == true && this.file != null) {
          const filePath = "atracciones/" + this.lugar.id;
          this.storage.ref(filePath).delete();
          const fileRef = this.storage.ref(filePath);
          const task = this.storage.upload(filePath, this.file);
        }
        swal.fire(
          "Atraccion Editada",
          "Tu atraccion se a editado con exito",
          "success"
        );
        this.router.navigate([`/usuario`]);
      } else {
        this.lugar.id = Date.now();
        this.lugar.propietario = this.angularFireAuth.auth.currentUser.uid;
        this.lugar.calificacion = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        this.lugar.estoyaqui = 0;
        this.lugar.visto = 0;
        this.lugaresService.guardarLugar(this.lugar);
        const filePath = "atracciones/" + this.lugar.id;
        const fileRef = this.storage.ref(filePath);
        const task = this.storage.upload(filePath, this.file);
        swal.fire(
          "Atraccion Creada!",
          "Tu atraccion se a creado con exito",
          "success"
        );
        this.router.navigate([`/detalle/${this.lugar.id}`]);
      }
      this.lugar = {};
    });
  }

  uploadFile(event) {
    this.file = event.target.files[0];
    this.newFile = true;
  }

  public botFiltro() {
    var grocerias = [
      "puta",
      "puto",
      "marica",
      "mierda",
      "chingadera",
      "chinga",
      "puteria",
      "mamada",
      "chupala",
      "alv",
      "chupala",
      "verga",
      "pendejo",
      "chingar",
      "mamar",
      "mamando",
      "puteria",
      "chingado",
      "culo",
      "culero",
      "estupido",
      "idiota",
      "baboso",
      "cabron",
      "pito",
      "tarado",
      "tonto",
      "cagas",
      "joto",
      "prostituta",
      "golfa",
      "malparida",
      "malparido",
      "ano",
      "pene",
      "vagina",
      "tetas",
      "chichis",
      "bubis",
      "jodido",
      "madrazo",
      "castra",
      "pinche",
      "emputado",
      "encabronado",
      "bastardo"
    ];

    var nodo = document.getElementById("desc") as any;
    var textarea = nodo.value.toLowerCase();
    for (var i = 0; i < grocerias.length; i++) {
      const regex = new RegExp("(^|\\s)" + grocerias[i] + "($|(?=\\s))", "gi");
      textarea = textarea.replace(regex, "!@$$#;");
    }
    nodo.value = textarea;
    //console.log("Tengo descripcion: "+nodo.value);
    this.lugar.descripcion = nodo.value;
    this.guardarLugar();
  }
}
