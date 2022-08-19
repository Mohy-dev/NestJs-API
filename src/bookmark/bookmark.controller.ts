import { EditBookmarkDto } from './dto/edit-bookmark.dto';
/*eslint-disable*/
import { JwtGuard } from './../auth/guard/jwt.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { BookmarkService } from './bookmark.service';
import { GetUser } from '../auth/decorator';
import { createBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmark')
export class BookmarkController {
  constructor(
    private prisma: PrismaService,
    private bookmarkService: BookmarkService,
  ) {}

  @Post()
  createBookmark(
    @GetUser('id') userId: any,
    @Body() dto: createBookmarkDto,
  ) {
    return this.bookmarkService.createBookmark(
      userId.id,
      dto,
    );
  }

  @Get()
  getBookmarks(@GetUser('id') userId: any) {
    return this.bookmarkService.getBookmarks(userId.id);
  }

  @Get(':id')
  getBookmarkById(
    @GetUser('id') userId: any,
    @Param('id', ParseIntPipe) BookmarkId: number,
  ) {
    return this.bookmarkService.getBookmarkById(
      userId.id,
      BookmarkId,
    );
  }

  @Patch(':id')
  editBookmark(
    @GetUser('id') userId: any,
    @Param('id', ParseIntPipe) BookmarkId: number,
    @Body() dto: EditBookmarkDto,
  ) {
    return this.bookmarkService.editBookmarkById(
      userId.id,
      BookmarkId,
      dto,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT) // 204
  @Delete(':id')
  deleteBookmark(
    @GetUser('id') userId: any,
    @Param('id', ParseIntPipe) BookmarkId: number,
  ) {
    return this.bookmarkService.deleteBookmark(
      userId.id,
      BookmarkId,
    );
  }
}
