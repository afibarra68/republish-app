import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommerceService } from './commerce.service';
import { CommerceController } from './commerce.controller';
import { Company, CompanySchema } from '../../schemas/company.schema';
import { CompanyRating, CompanyRatingSchema } from '../../schemas/company-rating.schema';
import { User, UserSchema } from '../../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      { name: CompanyRating.name, schema: CompanyRatingSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CommerceController],
  providers: [CommerceService],
  exports: [CommerceService],
})
export class CommerceModule {}
