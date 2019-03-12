// import { Test } from '@nestjs/testing';
//
// import { PostsController } from './voorspellingen.controller';
// import { VoorspellingenService } from './voorspellingen.service';
//
// describe('PostsController', () => {
//   let postsController: PostsController;
//   let postsService: VoorspellingenService;
//
//   beforeEach(async () => {
//     const module = await Test.createTestingModule({
//       controllers: [PostsController],
//       providers: [VoorspellingenService],
//     }).compile();
//
//     postsService = module.get<VoorspellingenService>(VoorspellingenService);
//     postsController = module.get<PostsController>(PostsController);
//   });
//
//   describe('findAll', () => {
//     it('should return an array of valid posts', async () => {
//       const result = [{ title: 'This is a test post' }];
//       jest.spyOn(postsService, 'findAll').mockImplementation(() => result);
//       expect(await postsController.findAll()).toBe(result);
//     });
//   });
// });