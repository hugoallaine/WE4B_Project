import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to format a duration in minutes to a string in the format HH:MM:SS or MM:SS.
 * 
 * @example
 * {{ 2.5 | durationPipe }} -> '02:30'
 * {{ 163.75 | durationPipe }} -> '02:43:45'
 */
@Pipe({
  name: 'durationPipe'
})
export class DurationPipe implements PipeTransform {

  transform(value: number): string {
    if (typeof value !== 'number' || isNaN(value) || value < 0) {
      return '00:00';
    }

    const totalSeconds = Math.floor(value * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    if (hours > 0) {
      return `${hours}:${formattedMinutes}:${formattedSeconds}`;
    } else {
      return `${formattedMinutes}:${formattedSeconds}`;
    }
  }

}
