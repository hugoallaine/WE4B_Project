import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { HomeComponent } from "./home/home.component";
import { AccountComponent } from "./account/account.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { StyleModule } from "./style/style.module";
import { AuthGuard } from "./guards/auth.guard";
import { MediaPlayerComponent } from "./media-player/media-player.component";
import { AlbumsComponent } from './albums/albums.component';
import { TracksComponent } from './tracks/tracks.component';
import { ArtistsComponent } from './artists/artists.component';
import { NotificationComponent } from './notification/notification.component';
import { ArtistDetailComponent } from './artist-detail/artist-detail.component';
import { AlbumDetailComponent } from './album-detail/album-detail.component';
import { MusicsComponent } from './musics/musics.component';
import { MoviesComponent } from './movies/movies.component';
import { MusicPlayerComponent } from './music-player/music-player.component';
import { DurationPipe } from './duration.pipe';

@NgModule({
    declarations: [
        AppComponent,
        NavbarComponent,
        HomeComponent,
        AccountComponent,
        LoginComponent,
        RegisterComponent,
        MediaPlayerComponent,
        AlbumsComponent,
        TracksComponent,
        ArtistsComponent,
        NotificationComponent,
        ArtistDetailComponent,
        AlbumDetailComponent,
        MusicsComponent,
        MoviesComponent,
        MusicPlayerComponent,
        DurationPipe,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        StyleModule,
        FormsModule,
    ],
    providers: [AuthGuard],
    bootstrap: [AppComponent],
})
export class AppModule {}
