<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->date('exam_date');
            $table->decimal('max_marks', 6, 2)->default(100);
            $table->decimal('pass_marks', 6, 2)->default(50);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_published')->default(false);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('class_id');
            $table->index('exam_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
