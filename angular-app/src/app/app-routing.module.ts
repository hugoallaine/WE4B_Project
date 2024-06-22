import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { HomeComponent } from "./home/home.component";
import { AuthGuard } from "./guards/auth.guard";
import { MediaPlayerComponent } from "./media-player/media-player.component";
import { AccountComponent } from "./account/account.component";
import { AlbumsComponent } from './albums/albums.component';
import { TracksComponent } from './tracks/tracks.component';
import { ArtistsComponent } from './artists/artists.component';
import { ArtistDetailComponent } from './artist-detail/artist-detail.component';
import { AlbumDetailComponent } from "./album-detail/album-detail.component";
import { MusicsComponent } from "./musics/musics.component";
import { MoviesComponent } from "./movies/movies.component";
import { MovieDetailComponent } from "./movie-detail/movie-detail.component";

const routes: Routes = [
    { path: "", redirectTo: "home", pathMatch: "full" },
    { path: "home", component: HomeComponent, canActivate: [AuthGuard] },
    { path: "login", component: LoginComponent },
    { path: "register", component: RegisterComponent },
    { path: "musics", component: MusicsComponent },
    { path: "movies", component: MoviesComponent },
    { path: "account", component: AccountComponent, canActivate: [AuthGuard] },
    { path: "player", component: MediaPlayerComponent },
    { path: 'albums', component: AlbumsComponent },
    { path: 'tracks', component: TracksComponent },
    { path: 'artists', component: ArtistsComponent },
    { path: 'artist/:id', component: ArtistDetailComponent },
    { path: 'album/:id', component: AlbumDetailComponent },
    { path: 'movie/:id', component: MovieDetailComponent },
    { path: "**", redirectTo: "home" },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
