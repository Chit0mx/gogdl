import { Component } from "@angular/core";
import { AutorizacionService } from "../services/autorizacion.service";

@Component({
  selector: "app-forgot",
  templateUrl: "./forgot.component.html"
})
export class ForgotComponent {
  email: string = "";
  msg: string = "";
  display: boolean = false;

  loginParams: any = {};
  constructor(private autorizacionService: AutorizacionService) {}
  forgot() {
    let user = this.autorizacionService.forgot(this.email);
    user
      .then(value => {
        this.msg = value;
        this.display = true;
      })
      .catch(err => {
        //console.log("Algo fue mal:", err.message);
        this.msg = err.message;
        this.display = true;
      });
  }
}
